# Quick Render deploy (Dockerfile-based)

1) Connect your GitHub repo to Render.
2) In Render create a new Web Service and select "Docker" as the environment.
3) Point Render to the repository root (Render will use `render.yaml`).
4) Set the Build Command to the default (Render will build the Docker image using the path in `render.yaml`).
5) Add the following environment variables in Render's UI (Settings → Environment):
   - `DATABASE_URL` — your Postgres URL
   - `SESSION_SECRET` — session secret
   - `AI_INTEGRATIONS_OPENAI_API_KEY` or `AZURE_OPENAI_API_KEY` — AI provider key
   - `VITE_API_URL` — backend URL (e.g., https://your-service.onrender.com)
6) Deploy. The backend Dockerfile lives at `ai_connector/Github-Connector/artifacts/api-server/Dockerfile` and the frontend Dockerfile at `ai_connector/Github-Connector/artifacts/halo-ai/Dockerfile`.

Local test:
1. Copy `.env.example` to `.env` and fill values.
2. Run:
```bash
docker compose up --build
```
3. Backend: http://localhost:8080
   Frontend: http://localhost:3000
