import { initializeApp } from "https://www.gstatic.com/firebasejs/11.11.1/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.11.1/firebase-auth.js";

const loginViewEl = document.getElementById("loginView");
const appViewEl = document.getElementById("appView");
const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const promptEl = document.getElementById("prompt");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const googleSignOutBtn = document.getElementById("googleSignOutBtn");
const authStatusEl = document.getElementById("authStatus");
const authBannerEl = document.getElementById("authBanner");
const userChipEl = document.getElementById("userChip");

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

function setSignedInView(userLabel) {
  loginViewEl.classList.add("hidden");
  appViewEl.classList.remove("hidden");
  userChipEl.textContent = `Signed in as ${userLabel}`;
}

function setSignedOutView() {
  appViewEl.classList.add("hidden");
  loginViewEl.classList.remove("hidden");
}

function showAuthBanner(text) {
  authBannerEl.textContent = text;
  authBannerEl.classList.remove("hidden");
}

function clearAuthBanner() {
  authBannerEl.textContent = "";
  authBannerEl.classList.add("hidden");
}

function mapFirebaseAuthError(error) {
  const message = String(error?.message || "");
  if (message.includes("popup-blocked")) {
    return "Popup blocked by browser. Use redirect sign-in and retry.";
  }
  if (message.includes("unauthorized-domain")) {
    return "This domain is not authorized in Firebase Auth settings.";
  }
  if (message.includes("operation-not-allowed")) {
    return "Google sign-in is not enabled in Firebase Auth providers.";
  }
  return `Sign-in failed: ${message || "unknown error"}`;
}

function addMessage(text, role) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function initFirebaseFromRuntimeConfig() {
  const { apiKey, authDomain, projectId } = firebaseConfig;
  if (!apiKey || !authDomain || !projectId) {
    setAuthStatus("Missing Firebase runtime config");
    showAuthBanner("Missing Firebase config. Contact support.");
    return false;
  }

  try {
    const app = initializeApp({ apiKey, authDomain, projectId });
    firebaseAuth = getAuth(app);

    try {
      await getRedirectResult(firebaseAuth);
    } catch (redirectError) {
      showAuthBanner(mapFirebaseAuthError(redirectError));
    }

    onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        firebaseToken = "";
        setAuthStatus("Signed out");
        setSignedOutView();
        showAuthBanner("Sign in to continue.");
        return;
      }

      firebaseToken = await user.getIdToken();
      setAuthStatus(`Signed in as ${user.email || user.uid}`);
      clearAuthBanner();
      setSignedInView(user.email || user.uid);
    });

    setAuthStatus("Ready");
    return true;
  } catch (error) {
    setAuthStatus(`Init failed: ${error.message}`);
    showAuthBanner(`Firebase init failed: ${error.message}`);
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
    await signInWithRedirect(firebaseAuth, provider);
  } catch (error) {
    setAuthStatus("Sign-in failed");
    showAuthBanner(mapFirebaseAuthError(error));
  }
});

googleSignOutBtn.addEventListener("click", async () => {
  if (!firebaseAuth) {
    return;
  }

  try {
    await signOut(firebaseAuth);
    clearAuthBanner();
  } catch (error) {
    showAuthBanner(`Sign-out failed: ${error.message}`);
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
    setSignedOutView();
    showAuthBanner("Authentication required. Sign in to continue.");
    return;
  }

  addMessage(message, "user");
  promptEl.value = "";

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseToken}`,
    };
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
      if (response.status === 401) {
        setSignedOutView();
        showAuthBanner("Session expired or unauthorized. Sign in again.");
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    addMessage(data.response || "(empty response)", "bot");
  } catch (error) {
    addMessage(`Request failed: ${error.message}`, "bot");
  }
});

setSignedOutView();
if (!initFirebaseFromRuntimeConfig()) {
  addMessage("App config missing. Contact support.", "bot");
}
