import { Router } from "express";
import { db } from "@workspace/db";
import { appConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const GITHUB_TOKEN_KEY = "github_token";
const GITHUB_REPO_URL_KEY = "github_repo_url";
const GITHUB_SSH_KEY_KEY = "github_ssh_key";
const router = Router();

async function setConfig(key: string, value: string) {
  await db
    .insert(appConfigTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: appConfigTable.key, set: { value, updatedAt: new Date() } });
}

async function getConfig(key: string): Promise<string | null> {
  const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

router.get("/config", async (req, res) => {
  try {
    const token = await getConfig(GITHUB_TOKEN_KEY);
    const repoUrl = await getConfig(GITHUB_REPO_URL_KEY);
    const hasSshKey = !!(await getConfig(GITHUB_SSH_KEY_KEY));

    if (!token && !hasSshKey) {
      res.json({ configured: false, username: null, repoUrl, hasSshKey });
      return;
    }

    if (token) {
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${token}`, "User-Agent": "Halo-AI-Assistant" },
        });
        if (response.ok) {
          const user = (await response.json()) as { login: string };
          res.json({ configured: true, username: user.login, repoUrl, hasSshKey });
          return;
        }
      } catch {
        // token stored but not reachable
      }
    }

    res.json({ configured: !!token || hasSshKey, username: null, repoUrl, hasSshKey });
  } catch (err) {
    req.log.error({ err }, "Failed to get GitHub config");
    res.status(500).json({ error: "Failed to get GitHub config" });
  }
});

router.post("/config", async (req, res) => {
  try {
    const { token, repoUrl, sshKey } = req.body as { token?: string; repoUrl?: string; sshKey?: string };
    if (token !== undefined) await setConfig(GITHUB_TOKEN_KEY, token);
    if (repoUrl !== undefined) await setConfig(GITHUB_REPO_URL_KEY, repoUrl);
    if (sshKey !== undefined) await setConfig(GITHUB_SSH_KEY_KEY, sshKey);
    res.json({ message: "Saved" });
  } catch (err) {
    req.log.error({ err }, "Failed to save GitHub config");
    res.status(500).json({ error: "Failed to save GitHub config" });
  }
});

router.delete("/config/ssh-key", async (req, res) => {
  try {
    await db.delete(appConfigTable).where(eq(appConfigTable.key, GITHUB_SSH_KEY_KEY));
    res.json({ message: "SSH key removed" });
  } catch (err) {
    req.log.error({ err }, "Failed to remove SSH key");
    res.status(500).json({ error: "Failed to remove SSH key" });
  }
});

router.get("/repos", async (req, res) => {
  try {
    const token = await getConfig(GITHUB_TOKEN_KEY);
    if (!token) {
      res.json([]);
      return;
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: { Authorization: `token ${token}`, "User-Agent": "Halo-AI-Assistant" },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "GitHub API error" });
      return;
    }

    const repos = (await response.json()) as Array<{
      id: number; name: string; full_name: string; description: string | null;
      html_url: string; private: boolean; language: string | null; updated_at: string;
    }>;

    res.json(repos.map((r) => ({
      id: r.id, name: r.name, fullName: r.full_name, description: r.description,
      url: r.html_url, private: r.private, language: r.language, updatedAt: r.updated_at,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get GitHub repos");
    res.status(500).json({ error: "Failed to get GitHub repos" });
  }
});

export default router;
