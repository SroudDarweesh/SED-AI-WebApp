import os

from openai import OpenAI


class AgentClient:
    def __init__(self) -> None:
        self.mock_mode = os.getenv("AGENT_MOCK_MODE", "true").lower() == "true"
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate_reply(self, message: str, session_id: str) -> str:
        if self.mock_mode:
            return f"[mock-openai][session={session_id}] {message}"

        if self.client is None:
            return f"[openai-missing-key][session={session_id}] {message}"

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are the SED AI assistant. Respond clearly and concisely.",
                },
                {"role": "user", "content": message},
            ],
        )
        content = completion.choices[0].message.content
        if not content:
            return f"[openai-empty-response][session={session_id}]"
        return content
