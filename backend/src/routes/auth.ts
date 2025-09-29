import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { apiLimiter } from "../middleware/rateLimit";
import { userRegistrations, userLogins, apiErrors } from "../services/metrics";

const prisma = new PrismaClient();
const r = Router();
const cred = z.object({ 
  email: z.string().email("Invalid email format"), 
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional()
});

r.post("/signup", apiLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = cred.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name: name || null } });
    
    // Метрика регистрации
    userRegistrations.inc();
    
    res.json({ id: user.id, email: user.email });
  } catch (e) { 
    apiErrors.inc({ endpoint: '/api/auth/signup', error_type: 'signup_error', status: '500' });
    next(e); 
  }
});

r.post("/login", apiLimiter, async (req, res, next) => {
  try {
    const { email, password } = cred.parse(req.body);
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u || !u.password) {
      apiErrors.inc({ endpoint: '/api/auth/login', error_type: 'invalid_credentials', status: '401' });
      return res.status(401).json({ error: "Invalid creds" });
    }
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) {
      apiErrors.inc({ endpoint: '/api/auth/login', error_type: 'invalid_credentials', status: '401' });
      return res.status(401).json({ error: "Invalid creds" });
    }
    const token = jwt.sign({ sub: u.id, email: u.email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    
    // Метрика успешного логина
    userLogins.inc({ method: 'credentials' });
    
    res.json({ 
      id: u.id, 
      email: u.email, 
      name: u.name, 
      accessToken: token 
    });
  } catch (e) { 
    apiErrors.inc({ endpoint: '/api/auth/login', error_type: 'server_error', status: '500' });
    next(e); 
  }
});

// POST /api/auth/exchange { email }
// Create user if not exists and issue backend JWT for SSO
r.post("/exchange", apiLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    let u = await prisma.user.findUnique({ where: { email } });
    if (!u) {
      u = await prisma.user.create({ data: { email, password: null, name: null } });
    }
    const token = jwt.sign({ sub: u.id, email: u.email }, process.env.JWT_SECRET!, { expiresIn: "2h" });
    res.json({ token, user: { id: u.id, email: u.email } });
  } catch (e) { next(e); }
});
export default r;

