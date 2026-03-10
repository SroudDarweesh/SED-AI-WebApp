const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const promptEl = document.getElementById("prompt");
const apiBaseUrlEl = document.getElementById("apiBaseUrl");
const apiKeyEl = document.getElementById("apiKey");
const sessionIdEl = document.getElementById("sessionId");

const defaultApiBase = "https://sed-ai-agent-ye23ulhhjq-uc.a.run.app";
const defaultSessionId = `s-${Math.random().toString(36).slice(2, 10)}`;

apiBaseUrlEl.value = localStorage.getItem("sed_api_base_url") || defaultApiBase;
apiKeyEl.value = localStorage.getItem("sed_api_key") || "";
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
