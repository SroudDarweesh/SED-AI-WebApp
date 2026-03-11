# Architecture Notes

## Current stack

- `web/` Static frontend chat client
- `agent/` FastAPI backend service
- Google ADK runner in backend (`agent/src/adk_agent/client.py`)
- Cloud Run hosting for backend API and frontend static site
- Deployed backend URL: `https://sed-ai-agent-ye23ulhhjq-uc.a.run.app`

## Request flow

1. User signs in with Google from the web app (Firebase Auth).
2. Frontend sends `POST /chat` to backend with `message`, `session_id`, and `Authorization: Bearer <firebase-id-token>`.
3. Backend verifies Firebase ID token, applies API key/rate limiting checks, then forwards request to Google ADK runner (`Runner.run_async`).
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
- `REQUIRE_FIREBASE_AUTH=true|false`
- `FIREBASE_PROJECT_ID=<project-id>`
- `CHAT_API_KEY=<optional-shared-secret>`
- `RATE_LIMIT_WINDOW_SECONDS=60`
- `RATE_LIMIT_MAX_REQUESTS=30`

Recommended production CORS:
- `CORS_ALLOW_ORIGINS=https://your-web-cloud-run-url`
