FROM python:3.12-slim

WORKDIR /app
COPY . .

EXPOSE 8080
CMD ["sh", "-c", "printf 'window.__SED_CONFIG = {\\n  apiBaseUrl: \"%s\",\\n  apiKey: \"%s\",\\n  firebase: { apiKey: \"%s\", authDomain: \"%s\", projectId: \"%s\" }\\n};\\n' \"${WEB_API_BASE_URL}\" \"${WEB_API_KEY}\" \"${WEB_FIREBASE_API_KEY}\" \"${WEB_FIREBASE_AUTH_DOMAIN}\" \"${WEB_FIREBASE_PROJECT_ID}\" > /app/runtime-config.js && python -m http.server ${PORT:-8080} --bind 0.0.0.0"]
