# Render Deployment Checklist

**Step 1: Copy your Neon database URL**
- Once you create Neon account, you'll get a connection string that looks like:
  ```
  postgresql://user:password@host.neon.tech/database
  ```
- Copy this to clipboard

**Step 2: Go to Render Dashboard**
- https://dashboard.render.com
- Click **New +** → **Web Service**
- Select **GitHub** and authorize if needed
- Choose repo: `devvycoder321/JointHaloRepo`

**Step 3: Configure the Service**
| Field | Value |
|-------|-------|
| **Name** | `haloit-api` (or any name) |
| **Environment** | Docker |
| **Dockerfile Path** | `ai_connector/Github-Connector/artifacts/api-server/Dockerfile` |
| **Build Command** | (leave empty) |
| **Start Command** | (leave empty) |

**Step 4: Add Environment Variables**
In the **Environment** section, click **Add Environment Variable** for each:

1. **Key:** `DATABASE_URL`  
   **Value:** *(paste your Neon connection string here)*

2. **Key:** `SESSION_SECRET`  
   **Value:** `halo-session-secret-2026` (any random string)

3. **Key:** `AI_INTEGRATIONS_OPENAI_API_KEY`  
   **Value:** *(leave blank for now, add later if you have OpenAI key)*

4. **Key:** `NODE_ENV`  
   **Value:** `production`

**Step 5: Deploy**
- Click **Create Web Service**
- Render automatically builds and deploys
- Wait ~3-5 minutes
- You'll get a URL like: `https://haloit-api-xxx.onrender.com`

**Step 6: Test**
- Visit: `https://haloit-api-xxx.onrender.com/api/config`
- If you see JSON or a 200 response, it's working!

✅ Done! Your backend is live.
