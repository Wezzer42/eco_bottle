import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimit";
import { cacheMiddleware, deleteCached } from "../services/cache";

const prisma = new PrismaClient();
const r = Router();

// Apply caching to GET requests (30s TTL)
r.get("/", apiLimiter, cacheMiddleware(30), async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    res.json(products);
  } catch (e) { next(e); }
});

const ProductDto = z.object({
  name: z.string().min(2),
  price: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  stock: z.number().int().nonnegative().optional()
});

r.post("/", requireAuth, apiLimiter, async (req, res, next) => {
  try {
    const dto = ProductDto.parse(req.body);
    const p = await prisma.product.create({ data: dto });
    // Invalidate product cache
    await deleteCached("page:/api/products*");
    res.status(201).json(p);
  } catch (e) { next(e); }
});

r.put("/:id", requireAuth, apiLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dto = ProductDto.partial().parse(req.body);
    const p = await prisma.product.update({ where: { id }, data: dto });
    // Invalidate product cache
    await deleteCached("page:/api/products*");
    res.json(p);
  } catch (e) { next(e); }
});

r.delete("/:id", requireAuth, apiLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    // Invalidate product cache
    await deleteCached("page:/api/products*");
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;

