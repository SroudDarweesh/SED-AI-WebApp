# SED AI WebApp

Starter monorepo for an SED AI agent web app targeting Google Cloud Run and Google ADK.

## Project structure

- `agent/` Python ADK agent service
- `web/` Static frontend chat client
- `infra/` Cloud Run and Terraform deployment scaffolding
- `scripts/` Local/dev helper scripts
- `docs/` Architecture and deployment docs

## Next steps

1. Backend deployed URL: `https://sed-ai-agent-ye23ulhhjq-uc.a.run.app`.
2. Enable Firebase Auth (Google Sign-In) and set `REQUIRE_FIREBASE_AUTH=true` on backend.
3. Restrict backend `CORS_ALLOW_ORIGINS` to the deployed web URL.

## Operations

- Production runbook: `docs/production-checklist.md`
