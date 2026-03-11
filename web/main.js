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
const apiBaseUrlEl = document.getElementById("apiBaseUrl");
const apiKeyEl = document.getElementById("apiKey");
const sessionIdEl = document.getElementById("sessionId");
const firebaseApiKeyEl = document.getElementById("firebaseApiKey");
const firebaseAuthDomainEl = document.getElementById("firebaseAuthDomain");
const firebaseProjectIdEl = document.getElementById("firebaseProjectId");
const initFirebaseBtn = document.getElementById("initFirebaseBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const googleSignOutBtn = document.getElementById("googleSignOutBtn");
const authStatusEl = document.getElementById("authStatus");

const defaultApiBase = "https://sed-ai-agent-768720277381.us-central1.run.app";
const defaultSessionId = `s-${Math.random().toString(36).slice(2, 10)}`;

apiBaseUrlEl.value = localStorage.getItem("sed_api_base_url") || defaultApiBase;
apiKeyEl.value = localStorage.getItem("sed_api_key") || "";
sessionIdEl.value = localStorage.getItem("sed_session_id") || defaultSessionId;
firebaseApiKeyEl.value = localStorage.getItem("sed_firebase_api_key") || "";
firebaseAuthDomainEl.value = localStorage.getItem("sed_firebase_auth_domain") || "";
firebaseProjectIdEl.value = localStorage.getItem("sed_firebase_project_id") || "";

let firebaseAuth = null;
let firebaseToken = "";

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

function saveFirebaseConfig() {
  localStorage.setItem("sed_firebase_api_key", firebaseApiKeyEl.value.trim());
  localStorage.setItem("sed_firebase_auth_domain", firebaseAuthDomainEl.value.trim());
  localStorage.setItem("sed_firebase_project_id", firebaseProjectIdEl.value.trim());
}

function initFirebase() {
  saveFirebaseConfig();

  const apiKey = firebaseApiKeyEl.value.trim();
  const authDomain = firebaseAuthDomainEl.value.trim();
  const projectId = firebaseProjectIdEl.value.trim();

  if (!apiKey || !authDomain || !projectId) {
    setAuthStatus("Missing Firebase config");
    return;
  }

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

  setAuthStatus("Initialized");
}

initFirebaseBtn.addEventListener("click", () => {
  try {
    initFirebase();
  } catch (error) {
    setAuthStatus(`Init failed: ${error.message}`);
  }
});

googleSignInBtn.addEventListener("click", async () => {
  if (!firebaseAuth) {
    setAuthStatus("Initialize Firebase first");
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
    setAuthStatus("Initialize Firebase first");
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
  const apiBaseUrl = apiBaseUrlEl.value.trim().replace(/\/$/, "");
  const apiKey = apiKeyEl.value.trim();
  const sessionId = sessionIdEl.value.trim();

  if (!message || !apiBaseUrl || !sessionId) {
    return;
  }

  localStorage.setItem("sed_api_base_url", apiBaseUrl);
  localStorage.setItem("sed_api_key", apiKey);
  localStorage.setItem("sed_session_id", sessionId);

  addMessage(message, "user");
  promptEl.value = "";

  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }
    if (firebaseToken) {
      headers.Authorization = `Bearer ${firebaseToken}`;
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
