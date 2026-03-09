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
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

`ADK_MOCK_MODE=true` (default) returns deterministic mock responses.
