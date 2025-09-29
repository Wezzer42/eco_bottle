import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { apiLimiter } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/auth";
import { cacheMiddleware, deleteCached } from "../services/cache";

const prisma = new PrismaClient();
const r = Router();

// GET /api/waitlist - получить список (только для админов)
r.get("/", requireAuth, cacheMiddleware(60), async (_req, res, next) => {
  try {
    const waitlist = await prisma.waitlist.findMany({ 
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true }
    });
    res.json(waitlist);
  } catch (e) { next(e); }
});

// POST /api/waitlist - добавить в waitlist
r.post("/", apiLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email("Invalid email format") }).parse(req.body);
    const v = await prisma.waitlist.upsert({
      where: { email },
      update: {},
      create: { email }
    });
    
    // Очищаем кеш waitlist при добавлении нового email
    await deleteCached("page:/api/waitlist*");
    
    res.status(201).json({ id: v.id, email: v.email });
  } catch (e) { next(e); }
});

export default r;

