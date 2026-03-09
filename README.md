# SED AI WebApp

Starter monorepo for an SED AI agent web app targeting Google Cloud Run with OpenAI.

## Project structure

- `agent/` Python agent service (OpenAI-backed)
- `web/` Frontend web app scaffold
- `infra/` Cloud Run and Terraform deployment scaffolding
- `scripts/` Local/dev helper scripts
- `docs/` Architecture and deployment docs

## Next steps

1. Implement production tools/guardrails in the agent runtime.
2. Build the web UX in `web/`.
3. Wire deploy automation in `infra/` and `.github/workflows/`.
