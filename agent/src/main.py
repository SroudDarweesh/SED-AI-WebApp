from fastapi import FastAPI

from src.adk_agent.client import AdkAgentClient
from src.adk_agent.schemas import ChatRequest, ChatResponse

app = FastAPI(title="SED AI Agent Service")
agent_client = AdkAgentClient()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    response_text = await agent_client.generate_reply(
        message=payload.message,
        session_id=payload.session_id,
    )
    return ChatResponse(
        session_id=payload.session_id,
        response=response_text,
    )
