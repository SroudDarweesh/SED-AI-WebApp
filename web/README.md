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
