import { Router } from "express";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    status: "ok",
    service: "AI API",
    message: "AI route is available",
  });
});

router.post("/chat", async (req, res) => {
  res.json({
    status: "ok",
    message: "AI chat endpoint placeholder. Configure AI provider keys and runtime logic.",
    requestBody: req.body,
  });
});

export default router;
