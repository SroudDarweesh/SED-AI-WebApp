import { initializeApp } from "https://www.gstatic.com/firebasejs/11.11.1/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.11.1/firebase-auth.js";

const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const promptEl = document.getElementById("prompt");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const googleSignOutBtn = document.getElementById("googleSignOutBtn");
const authStatusEl = document.getElementById("authStatus");

const runtimeConfig = window.__SED_CONFIG || {};
const apiBaseUrl = (runtimeConfig.apiBaseUrl || "").trim().replace(/\/$/, "");
const apiKey = (runtimeConfig.apiKey || "").trim();
const firebaseConfig = runtimeConfig.firebase || {};
const defaultSessionId = `s-${Math.random().toString(36).slice(2, 10)}`;

let firebaseAuth = null;
let firebaseToken = "";
const sessionId = localStorage.getItem("sed_session_id") || defaultSessionId;
localStorage.setItem("sed_session_id", sessionId);

function setAuthStatus(text) {
  authStatusEl.textContent = `Auth: ${text}`;
}

function addMessage(text, role) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function initFirebaseFromRuntimeConfig() {
  const { apiKey, authDomain, projectId } = firebaseConfig;
  if (!apiKey || !authDomain || !projectId) {
    setAuthStatus("Missing Firebase runtime config");
    return false;
  }

  try {
    const app = initializeApp({ apiKey, authDomain, projectId });
    firebaseAuth = getAuth(app);

    onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        firebaseToken = "";
        setAuthStatus("Signed out");
        return;
      }

      firebaseToken = await user.getIdToken();
      setAuthStatus(`Signed in as ${user.email || user.uid}`);
    });

    setAuthStatus("Ready");
    return true;
  } catch (error) {
    setAuthStatus(`Init failed: ${error.message}`);
    return false;
  }
}

googleSignInBtn.addEventListener("click", async () => {
  if (!firebaseAuth) {
    setAuthStatus("Firebase not ready");
    return;
  }

  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    setAuthStatus(`Sign-in failed: ${error.message}`);
  }
});

googleSignOutBtn.addEventListener("click", async () => {
  if (!firebaseAuth) {
    setAuthStatus("Firebase not ready");
    return;
  }

  try {
    await signOut(firebaseAuth);
  } catch (error) {
    setAuthStatus(`Sign-out failed: ${error.message}`);
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = promptEl.value.trim();

  if (!message || !apiBaseUrl) {
    addMessage("Configuration error: missing API endpoint.", "bot");
    return;
  }

  if (!firebaseToken) {
    addMessage("Please sign in with Google first.", "bot");
    return;
  }

  addMessage(message, "user");
  promptEl.value = "";

  try {
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${firebaseToken}` };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    addMessage(data.response || "(empty response)", "bot");
  } catch (error) {
    addMessage(`Request failed: ${error.message}`, "bot");
  }
});

if (!initFirebaseFromRuntimeConfig()) {
  addMessage("App config missing. Contact support.", "bot");
}
