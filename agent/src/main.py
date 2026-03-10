import os
import time
from threading import Lock

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.adk_agent.client import AdkAgentClient
from src.adk_agent.schemas import ChatRequest, ChatResponse

app = FastAPI(title="SED AI Agent Service")
agent_client = AdkAgentClient()
chat_api_key = os.getenv("CHAT_API_KEY", "").strip()
rate_limit_window_seconds = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
rate_limit_max_requests = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "30"))
rate_limit_store: dict[str, tuple[float, int]] = {}
rate_limit_lock = Lock()

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


def _get_client_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get("x-forwarded-for", "").strip()
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _is_rate_limited(client_ip: str) -> bool:
    now = time.time()
    with rate_limit_lock:
        window_start, count = rate_limit_store.get(client_ip, (now, 0))
        if now - window_start >= rate_limit_window_seconds:
            window_start = now
            count = 0
        count += 1
        rate_limit_store[client_ip] = (window_start, count)
        return count > rate_limit_max_requests


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.method == "POST" and request.url.path == "/chat":
        if _is_rate_limited(_get_client_ip(request)):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please retry later."},
            )
    return await call_next(request)


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
