# Architecture Notes

## Current stack

- `web/` Static frontend chat client
- `agent/` FastAPI backend service
- Google ADK runner in backend (`agent/src/adk_agent/client.py`)
- Cloud Run hosting for backend API

## Request flow

1. User submits a message from frontend.
2. Frontend sends `POST /chat` to backend with `message` and `session_id`.
3. Backend forwards message into Google ADK runner (`Runner.run_async`).
4. ADK model returns final response text.
5. Backend sends JSON response back to frontend.

## Config

Backend env variables:
- `GOOGLE_GENAI_USE_VERTEXAI=true`
- `GOOGLE_CLOUD_PROJECT=<project-id>`
- `GOOGLE_CLOUD_LOCATION=us-central1`
- `ADK_MODEL=gemini-2.5-flash`
- `ADK_MOCK_MODE=false`
- `CORS_ALLOW_ORIGINS=<comma-separated-origins>`
