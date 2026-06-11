# Deployment Rules for JointHaloRepo

This repository contains two separate systems in one codebase:

1. **HaloIT MSP system**
   - Root Dockerfile: `Dockerfile`
   - MSP backend source: `halo-system/backend`
   - MSP frontend/static site: `halo-system/frontend`
   - Use this service for the main HaloIT MSP website and management platform.

2. **AI assistant**
   - Render config: `render.yaml`
   - AI backend Dockerfile: `ai_connector/Github-Connector/artifacts/api-server/Dockerfile`
   - This service is a separate AI coding assistant that integrates into the MSP system.

## Rules

- Do not replace the root `Dockerfile` with the AI backend build.
  - The root `Dockerfile` belongs to the HaloIT MSP system.
  - The AI assistant is deployed using `render.yaml` only.

- `render.yaml` defines both services for Render:
  - `haloit-api` → AI assistant service
  - `haloit-msp` → HaloIT MSP service

- Both services may share the same SQL database.
  - Set the same `DATABASE_URL` in Render environment variables for both services.
  - Example: `DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname`

- For AI access:
  - Deploy AI under its own subdomain or subpath.
  - Example AI URL: `https://ai.haloitservices365.com` or `https://haloitservices365.com/AIassistant`
  - Use the MSP frontend to link to the AI assistant.

- Keep environment variables separate from source control.
  - Use `.env` locally and Render secrets in the Render dashboard.
  - Do not commit `.env` or actual API keys.

## Future updates

- If you need another service, add it to `render.yaml` rather than reusing the root `Dockerfile`.
- Update this file whenever the repo gains new deploy targets.
