import os

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


class AdkAgentClient:
    def __init__(self) -> None:
        self.mock_mode = os.getenv("ADK_MOCK_MODE", "true").lower() == "true"
        self.app_name = os.getenv("ADK_APP_NAME", "sed_ai_agent")
        self.user_id = os.getenv("ADK_USER_ID", "web_user")
        self.model = os.getenv("ADK_MODEL", "gemini-2.5-flash")

        if not self.mock_mode:
            self.agent = Agent(
                name="sed_ai_assistant",
                model=self.model,
                instruction="You are the SED AI assistant. Respond clearly and concisely.",
                description="SED AI assistant agent",
            )
            self.session_service = InMemorySessionService()
            self.runner = Runner(
                agent=self.agent,
                app_name=self.app_name,
                session_service=self.session_service,
            )

    async def _ensure_session(self, session_id: str) -> None:
        try:
            existing = await self.session_service.get_session(
                app_name=self.app_name,
                user_id=self.user_id,
                session_id=session_id,
            )
            if existing is not None:
                return
        except Exception:
            pass

        await self.session_service.create_session(
            app_name=self.app_name,
            user_id=self.user_id,
            session_id=session_id,
        )

    async def generate_reply(self, message: str, session_id: str) -> str:
        if self.mock_mode:
            return f"[mock-adk][session={session_id}] {message}"

        await self._ensure_session(session_id)

        user_content = types.Content(
            role="user",
            parts=[types.Part(text=message)],
        )

        final_response_text = ""
        async for event in self.runner.run_async(
            user_id=self.user_id,
            session_id=session_id,
            new_message=user_content,
        ):
            if event.is_final_response() and event.content and event.content.parts:
                text_parts = [
                    part.text for part in event.content.parts if getattr(part, "text", None)
                ]
                if text_parts:
                    final_response_text = "".join(text_parts).strip()

        if final_response_text:
            return final_response_text

        return f"[adk-no-final-response][session={session_id}]"
