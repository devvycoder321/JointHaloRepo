Render deployment notes
----------------------

This folder provides a minimal `render.yaml` and helper scripts to deploy the prebuilt API server to Render (free tier) or to build the Docker image locally.

Quick steps (Docker-based deploy on Render):

1. Connect your GitHub repo to Render and point the service to the `ai_connector/Github-Connector` folder (the `render.yaml` is included).
2. Render will use the `artifacts/api-server/Dockerfile` to build the container. Ensure environment variables are set in Render: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `VITE_API_URL`, and any Azure OpenAI keys.

Local build and test:

```bash
cd ai_connector/Github-Connector
chmod +x scripts/build-image.sh scripts/push_force.sh
./scripts/build-image.sh
docker run -p 8080:8080 -e PORT=8080 -e NODE_ENV=production haloit-api:local
```

To push code to a remote (force):

```bash
./scripts/push_force.sh
```

Notes:
- Render free services sleep when idle; use an uptime monitor if needed.
- The API requires secrets — do not commit `.env` to the repo.
