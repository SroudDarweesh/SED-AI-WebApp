import os

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from src.adk_agent.client import AdkAgentClient
from src.adk_agent.schemas import ChatRequest, ChatResponse

app = FastAPI(title="SED AI Agent Service")
agent_client = AdkAgentClient()
chat_api_key = os.getenv("CHAT_API_KEY", "").strip()

default_origins = "http://localhost,http://localhost:4173"
raw_origins = os.getenv("CORS_ALLOW_ORIGINS", default_origins)
allow_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_chat_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    if not chat_api_key:
        return
    if x_api_key != chat_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, _: None = Depends(require_chat_api_key)) -> ChatResponse:
    response_text = await agent_client.generate_reply(
        message=payload.message,
        session_id=payload.session_id,
    )
    return ChatResponse(
        session_id=payload.session_id,
        response=response_text,
    )
