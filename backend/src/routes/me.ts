import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimit";
import { cacheMiddleware, deleteCached } from "../services/cache";

const prisma = new PrismaClient();
const r = Router();

// GET /api/me - получить профиль (кешируем на 15 секунд)
r.get("/", requireAuth, cacheMiddleware(15), async (req, res, next) => {
  try {
    const uid = (req as any).user.sub ?? (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name || "",
      createdAt: user.createdAt 
    });
  } catch (e) { next(e); }
});

// PUT /api/me - обновить профиль (имя)
r.put("/", requireAuth, apiLimiter, async (req, res, next) => {
  try {
    const uid = (req as any).user.sub ?? (req as any).user.id;
    const { name } = z.object({ 
      name: z.string().min(1, "Name is required").max(100, "Name too long") 
    }).parse(req.body);
    
    const user = await prisma.user.update({
      where: { id: uid },
      data: { name }
    });
    
    // Очищаем кеш профиля пользователя
    await deleteCached("page:/api/me*");
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      message: "Profile updated successfully" 
    });
  } catch (e) { next(e); }
});

// PUT /api/me/password - смена пароля
r.put("/password", requireAuth, apiLimiter, async (req, res, next) => {
  try {
    const uid = (req as any).user.sub ?? (req as any).user.id;
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "New password must be at least 6 characters")
    }).parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Cannot change password for OAuth users" });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: uid },
      data: { password: hashedNewPassword }
    });
    
    res.json({ message: "Password changed successfully" });
  } catch (e) { next(e); }
});

export default r;

