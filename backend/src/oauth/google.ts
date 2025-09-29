import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const r = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!; // e.g. http://localhost:4000/api/auth/google/callback

function signAccess(payload: { id: string; email: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
}
function signRefresh(payload: { id: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

r.get("/google", (_req, res) => {
  const state = crypto.randomUUID();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

r.get("/google/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).send("Missing code");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI
    })
  });
  const tokens = (await tokenRes.json()) as Partial<{ id_token: string; access_token: string; refresh_token?: string; token_type?: string; scope?: string; expires_in?: number }>;
  if (!tokenRes.ok || !tokens.id_token) return res.status(401).send("Token exchange failed");

  const parts = tokens.id_token.split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { sub: string; email?: string; name?: string };
  const googleId = payload.sub;
  const email = payload.email || "";
  const name = payload.name;

  let account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: googleId } },
    include: { user: true }
  });

  let user = account?.user || (email ? await prisma.user.findUnique({ where: { email } }) : null);
  if (!user) {
    user = await prisma.user.create({ data: { email, name: name || null, password: "" } });
  }
  if (!account) {
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "google",
        providerAccountId: googleId,
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        tokenType: tokens.token_type ?? null,
        scope: tokens.scope ?? null,
        expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null
      }
    });
  }

  const access = signAccess({ id: user.id, email: user.email });
  const refresh = signRefresh({ id: user.id });
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };
  res.cookie("access_token", access, { ...opts, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refresh, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect(process.env.APP_AFTER_LOGIN_URL || "http://localhost:3000/profile");
});

export default r;

