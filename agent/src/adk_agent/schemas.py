from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, description="End-user chat message")
    session_id: str = Field(min_length=1, description="Conversation/session id")


class ChatResponse(BaseModel):
    session_id: str
    response: str
