# Web App

Static chat client for the SED AI backend.

## Local run

```bash
cd web
python3 -m http.server 4173
```

Open `http://localhost:4173` and set API URL:
- local backend: `http://localhost:8080` (or your current local port)
- cloud backend: your Cloud Run service URL
- if backend has `CHAT_API_KEY` enabled, enter the same key in the `API Key` field
- for Firebase auth:
  - fill Firebase `apiKey`, `authDomain`, `projectId`
  - click `Init Firebase`
  - click `Sign In with Google`
  - backend must have `REQUIRE_FIREBASE_AUTH=true`

## Firebase setup

1. In Firebase console, connect your GCP project.
2. Enable Authentication -> Sign-in method -> Google.
3. Add your web app and copy Firebase config values (`apiKey`, `authDomain`, `projectId`).
4. Add your web URLs to authorized domains for Firebase Auth:
   - local: `localhost`
   - cloud: your `sed-ai-web` domain

## Deploy to Cloud Run

```bash
PROJECT_ID="pure-particle-414515"
REGION="us-central1"
REPO="sed-ai"
WEB_SERVICE="sed-ai-web"
WEB_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/web:$(git rev-parse --short HEAD)"

gcloud builds submit ./web --tag "$WEB_IMAGE"
gcloud run deploy "$WEB_SERVICE" \
  --image "$WEB_IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated
```

After deploy, get web URL:

```bash
WEB_URL=$(gcloud run services describe "$WEB_SERVICE" --region "$REGION" --format='value(status.url)')
echo "$WEB_URL"
```

Then redeploy backend with strict CORS:

```bash
gcloud run deploy sed-ai-agent \
  --image "us-central1-docker.pkg.dev/pure-particle-414515/sed-ai/agent:$(git rev-parse --short HEAD)" \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="^|^GOOGLE_GENAI_USE_VERTEXAI=true|GOOGLE_CLOUD_PROJECT=pure-particle-414515|GOOGLE_CLOUD_LOCATION=us-central1|ADK_MODEL=gemini-2.5-flash|ADK_MOCK_MODE=false|CORS_ALLOW_ORIGINS=${WEB_URL}"
```
