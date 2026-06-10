import express from "express";
const router = express.Router();

// Sanitized chat route: requires runtime environment variables for AI keys.
const AI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;

router.post("/message", async (req, res) => {
  if (!AI_API_KEY) return res.status(500).json({ error: "AI provider API key not configured" });
  // TODO: implement chat handling using AI_API_KEY at runtime (do not embed keys)
  res.json({ status: "ok", note: "Chat route sanitized; configure API key via env vars." });
});

export default router;
