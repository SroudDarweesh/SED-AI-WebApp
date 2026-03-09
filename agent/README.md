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
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

`ADK_MOCK_MODE=true` (default) returns deterministic mock responses.
