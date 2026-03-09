# SED AI WebApp

Starter monorepo for an SED AI agent web app targeting Google Cloud Run and Google ADK.

## Project structure

- `agent/` Python ADK agent service
- `web/` Frontend web app scaffold
- `infra/` Cloud Run and Terraform deployment scaffolding
- `scripts/` Local/dev helper scripts
- `docs/` Architecture and deployment docs

## Next steps

1. Implement the Google ADK agent in `agent/src/adk_agent/`.
2. Build the web UX in `web/`.
3. Wire deploy automation in `infra/` and `.github/workflows/`.
