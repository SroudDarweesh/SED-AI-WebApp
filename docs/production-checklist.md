# Production Checklist

## 1) Web config

- Deploy `sed-ai-web` with:
  - `WEB_API_BASE_URL`
  - `WEB_FIREBASE_API_KEY`
  - `WEB_FIREBASE_AUTH_DOMAIN`
  - `WEB_FIREBASE_PROJECT_ID`
- Verify `https://<web-url>/runtime-config.js` contains expected values.

## 2) Firebase Auth

- Google provider enabled.
- Authorized domains include:
  - `localhost`
  - `<sed-ai-web-domain>`

## 3) Backend auth and CORS

- `REQUIRE_FIREBASE_AUTH=true`
- `FIREBASE_PROJECT_ID=<firebase-project-id>`
- `CORS_ALLOW_ORIGINS=<sed-ai-web-url>`
- Keep `ALLOW_DEV_AUTH_BYPASS=false` in production.

## 4) Smoke tests

- `GET /health` returns `{"status":"ok"}`
- `GET /ready` returns `{"status":"ready"}`
- Sign in from web UI and send test chat.

## 5) Logs and diagnostics

- Agent logs:
  - `gcloud run services logs read sed-ai-agent --region us-central1 --limit 100`
- Web logs:
  - `gcloud run services logs read sed-ai-web --region us-central1 --limit 100`
- Use `X-Request-ID` response header to correlate client issues with backend logs.
