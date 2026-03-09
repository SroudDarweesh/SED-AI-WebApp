import os


class AdkAgentClient:
    def __init__(self) -> None:
        self.mock_mode = os.getenv("ADK_MOCK_MODE", "true").lower() == "true"

    def generate_reply(self, message: str, session_id: str) -> str:
        if self.mock_mode:
            return f"[mock-adk][session={session_id}] {message}"

        # Placeholder for Google ADK execution flow.
        # Wire real ADK setup here once model and tool config is finalized.
        return f"[adk-not-configured][session={session_id}] {message}"
