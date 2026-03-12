# Agent Service

Python service intended to host the Google ADK agent and expose API endpoints for the web app.

## API

- `GET /health`
- `POST /chat`
  - Request: `{"message":"...","session_id":"..."}`
  - Response: `{"session_id":"...","response":"..."}`

## Local run

```bash
pip install -r requirements.txt
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export ADK_MODEL="gemini-2.5-flash"
export ADK_MOCK_MODE=false
export CORS_ALLOW_ORIGINS="http://localhost:4173,https://your-frontend-domain"
export CHAT_API_KEY="replace-with-strong-secret"
export RATE_LIMIT_WINDOW_SECONDS=60
export RATE_LIMIT_MAX_REQUESTS=30
export REQUIRE_FIREBASE_AUTH=true
export FIREBASE_PROJECT_ID="pure-particle-414515"
export ALLOW_DEV_AUTH_BYPASS=false
export DEV_AUTH_BYPASS_TOKEN=""
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

`ADK_MOCK_MODE=true` (default) returns deterministic mock responses.
`CORS_ALLOW_ORIGINS` defaults to `http://localhost,http://localhost:4173` if unset.
`CHAT_API_KEY` is optional; when set, clients must send `X-API-Key` for `POST /chat`.
Rate limit defaults: `30` chat requests per `60` seconds per client IP.
`REQUIRE_FIREBASE_AUTH=true` enforces `Authorization: Bearer <firebase-id-token>` on `POST /chat`.
`ALLOW_DEV_AUTH_BYPASS=true` enables `X-Dev-Bypass-Token` for local debugging only.
