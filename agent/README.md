# Agent Service

Python service intended to host the SED AI backend and expose API endpoints for the web app.

## API

- `GET /health`
- `POST /chat`
  - Request: `{"message":"...","session_id":"..."}`
  - Response: `{"session_id":"...","response":"..."}`

## Local run

```bash
pip install -r requirements.txt
export OPENAI_API_KEY="your_key_here"
export OPENAI_MODEL="gpt-4.1-mini"
export AGENT_MOCK_MODE=false
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

`AGENT_MOCK_MODE=true` (default) returns deterministic mock responses.
