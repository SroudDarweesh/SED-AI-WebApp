const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const promptEl = document.getElementById("prompt");
const apiBaseUrlEl = document.getElementById("apiBaseUrl");
const sessionIdEl = document.getElementById("sessionId");

const defaultApiBase = "http://localhost:8080";
const defaultSessionId = `s-${Math.random().toString(36).slice(2, 10)}`;

apiBaseUrlEl.value = localStorage.getItem("sed_api_base_url") || defaultApiBase;
sessionIdEl.value = localStorage.getItem("sed_session_id") || defaultSessionId;

function addMessage(text, role) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = promptEl.value.trim();
  const apiBaseUrl = apiBaseUrlEl.value.trim().replace(/\/$/, "");
  const sessionId = sessionIdEl.value.trim();

  if (!message || !apiBaseUrl || !sessionId) {
    return;
  }

  localStorage.setItem("sed_api_base_url", apiBaseUrl);
  localStorage.setItem("sed_session_id", sessionId);

  addMessage(message, "user");
  promptEl.value = "";

  try {
    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
