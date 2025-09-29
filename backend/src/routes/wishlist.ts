import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimit";
import { cacheMiddleware, deleteCached } from "../services/cache";
import { apiErrors } from "../services/metrics";
import { z } from "zod";

const prisma = new PrismaClient();
const r = Router();

const addToWishlistSchema = z.object({
  productId: z.number().int().positive(),
});

// GET /api/wishlist/check/:productId - проверить находится ли товар в wishlist
r.get("/check/:productId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiErrors.inc({ endpoint: '/api/wishlist/check/:productId', error_type: 'unauthorized', status: '401' });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      apiErrors.inc({ endpoint: '/api/wishlist/check/:productId', error_type: 'invalid_product_id', status: '400' });
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (e) {
    apiErrors.inc({ endpoint: '/api/wishlist/check/:productId', error_type: 'server_error', status: '500' });
    next(e);
  }
});

// GET /api/wishlist - получить список желаний пользователя
r.get("/", requireAuth, cacheMiddleware(60), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiErrors.inc({ endpoint: '/api/wishlist', error_type: 'unauthorized', status: '401' });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(wishlist.map(item => ({
      id: item.id,
      addedAt: item.createdAt,
      product: item.product
    })));
  } catch (e) {
    apiErrors.inc({ endpoint: '/api/wishlist', error_type: 'server_error', status: '500' });
    next(e);
  }
});

// POST /api/wishlist - добавить товар в список желаний
r.post("/", requireAuth, apiLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiErrors.inc({ endpoint: '/api/wishlist', error_type: 'unauthorized', status: '401' });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = addToWishlistSchema.parse(req.body);

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      apiErrors.inc({ endpoint: '/api/wishlist', error_type: 'product_not_found', status: '404' });
      return res.status(404).json({ error: "Product not found" });
    }

    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      return res.status(409).json({ error: "Product already in wishlist" });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: { product: true },
    });

    deleteCached(`page:/api/wishlist*`); // Invalidate cache
    res.status(201).json({
      id: wishlistItem.id,
      message: "Added to wishlist",
      product: {
        id: wishlistItem.product.id,
        name: wishlistItem.product.name,
        price: wishlistItem.product.price
      }
    });
  } catch (e) {
    apiErrors.inc({ endpoint: '/api/wishlist', error_type: 'add_to_wishlist_error', status: '500' });
    next(e);
  }
});

// DELETE /api/wishlist/:productId - удалить товар из списка желаний
r.delete("/:productId", requireAuth, apiLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiErrors.inc({ endpoint: '/api/wishlist/:productId', error_type: 'unauthorized', status: '401' });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      apiErrors.inc({ endpoint: '/api/wishlist/:productId', error_type: 'invalid_product_id', status: '400' });
      return res.status(400).json({ error: "Invalid product ID" });
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    deleteCached(`page:/api/wishlist*`); // Invalidate cache
    res.status(204).send();
  } catch (e) {
    if ((e as any).code === 'P2025') {
      // Record to delete does not exist
      apiErrors.inc({ endpoint: '/api/wishlist/:productId', error_type: 'item_not_found', status: '404' });
      return res.status(404).json({ error: "Item not found in wishlist" });
    }
    apiErrors.inc({ endpoint: '/api/wishlist/:productId', error_type: 'remove_from_wishlist_error', status: '500' });
    next(e);
  }
});

export default r;
