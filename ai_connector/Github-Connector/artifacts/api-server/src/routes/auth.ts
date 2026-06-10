import { Router } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, accessRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();
const SESSION_USER_KEY = "halo_user_id";
const SESSION_STEP_KEY = "halo_auth_step";

function getSession(req: { session: Express.Request["session"] }) {
  return req.session as unknown as Record<string, unknown>;
}

async function ensureAdminExists() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "willem.hattingh@haloitservices365.co.za")).limit(1);
  if (!existing.length) {
    const hash = await bcrypt.hash("H@l0IT_160B0684!2026", 12);
    await db.insert(usersTable).values({
      email: "willem.hattingh@haloitservices365.co.za",
      passwordHash: hash,
      role: "super_admin",
      isActive: true,
    });
    logger.info("Admin account created");
  }
}

ensureAdminExists().catch((err) => logger.error({ err }, "Failed to ensure admin exists"));

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
    if (!users.length || !users[0].isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const sess = getSession(req);
    sess[SESSION_USER_KEY] = user.id;
    sess[SESSION_STEP_KEY] = "pending_totp";

    if (!user.totpSecret) {
      res.json({ step: "totp_setup", message: "Set up your authenticator app" });
    } else {
      res.json({ step: "totp_verify", message: "Enter your authenticator code" });
    }
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/setup-totp", async (req, res) => {
  try {
    const userId = getSession(req)[SESSION_USER_KEY] as number | undefined;
    if (!userId) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!users.length) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const secret = speakeasy.generateSecret({ name: `Halo AI (${users[0].email})`, length: 20 });
    await db.update(usersTable).set({ totpSecret: secret.base32 }).where(eq(usersTable.id, userId));

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url ?? "");
    res.json({ secret: secret.base32, qrCodeUrl, otpauthUrl: secret.otpauth_url });
  } catch (err) {
    req.log.error({ err }, "Setup TOTP error");
    res.status(500).json({ error: "Failed to setup TOTP" });
  }
});

router.post("/verify-totp", async (req, res) => {
  try {
    const sess = getSession(req);
    const userId = sess[SESSION_USER_KEY] as number | undefined;
    if (!userId) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }
    const { token } = req.body as { token: string };

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!users.length || !users[0].totpSecret) {
      res.status(401).json({ error: "TOTP not configured" });
      return;
    }

    const verified = speakeasy.totp.verify({ secret: users[0].totpSecret, encoding: "base32", token, window: 1 });
    if (!verified) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    sess[SESSION_STEP_KEY] = "authenticated";
    res.json({ authenticated: true, message: "Authenticated successfully" });
  } catch (err) {
    req.log.error({ err }, "Verify TOTP error");
    res.status(500).json({ error: "Failed to verify TOTP" });
  }
});

router.get("/status", async (req, res) => {
  try {
    const sess = getSession(req);
    const userId = sess[SESSION_USER_KEY] as number | undefined;
    const step = sess[SESSION_STEP_KEY] as string | undefined;
    const authenticated = !!(userId && step === "authenticated");

    if (!authenticated) {
      res.json({ authenticated: false, email: null, role: null });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId!)).limit(1);
    if (!users.length) {
      res.json({ authenticated: false, email: null, role: null });
      return;
    }

    res.json({ authenticated: true, email: users[0].email, role: users[0].role });
  } catch (err) {
    req.log.error({ err }, "Auth status error");
    res.status(500).json({ error: "Failed to check status" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const sess = getSession(req);
    delete sess[SESSION_USER_KEY];
    delete sess[SESSION_STEP_KEY];
    res.json({ message: "Logged out" });
  } catch (err) {
    req.log.error({ err }, "Logout error");
    res.status(500).json({ error: "Logout failed" });
  }
});

router.post("/request-access", async (req, res) => {
  try {
    const { email, name, reason } = req.body as { email: string; name: string; reason?: string };
    if (!email || !name) {
      res.status(400).json({ error: "Email and name required" });
      return;
    }
    await db.insert(accessRequestsTable).values({ email, name, reason: reason ?? null });
    res.json({ message: "Request submitted. The admin will review your request." });
  } catch (err) {
    req.log.error({ err }, "Access request error");
    res.status(500).json({ error: "Failed to submit request" });
  }
});

router.get("/access-requests", async (req, res) => {
  try {
    const sess = getSession(req);
    const userId = sess[SESSION_USER_KEY] as number | undefined;
    const step = sess[SESSION_STEP_KEY] as string | undefined;
    if (!userId || step !== "authenticated") {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!users.length || users[0].role !== "super_admin") {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const requests = await db.select().from(accessRequestsTable).orderBy(accessRequestsTable.createdAt);
    res.json(requests.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Get access requests error");
    res.status(500).json({ error: "Failed to get requests" });
  }
});

export default router;
