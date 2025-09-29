import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";
import { cacheHits, cacheMisses, cacheOperations } from "./metrics";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(redisUrl);

export async function getCached<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function deleteCached(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Middleware для кеширования ответов
export function cacheMiddleware(ttlSeconds = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Кешируем только GET запросы
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `page:${req.originalUrl}`;
    const keyPrefix = req.originalUrl.split('?')[0].replace(/\/\d+/g, '/:id'); // Нормализуем ключ для метрик
    
    try {
      const startTime = Date.now();
      const cached = await getCached<{ data: any; headers: Record<string, string> }>(cacheKey);
      const duration = Date.now() - startTime;
      
      if (cached) {
        // Записываем метрики cache hit
        cacheHits.inc({ cache_key_prefix: keyPrefix });
        cacheOperations.observe({ operation: 'get', status: 'hit' }, duration);
        
        // Устанавливаем заголовки из кеша
        Object.entries(cached.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
        res.set('X-Cache-Status', 'HIT');
        return res.json(cached.data);
      }

      // Записываем метрики cache miss
      cacheMisses.inc({ cache_key_prefix: keyPrefix });
      cacheOperations.observe({ operation: 'get', status: 'miss' }, duration);

      // Перехватываем оригинальный res.json
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Сохраняем в кеш только успешные ответы
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const headers: Record<string, string> = {};
          Object.entries(res.getHeaders()).forEach(([key, value]) => {
            if (typeof value === 'string') {
              headers[key] = value;
            }
          });
          
          const setStartTime = Date.now();
          setCached(cacheKey, { data, headers }, ttlSeconds).then(() => {
            const setDuration = Date.now() - setStartTime;
            cacheOperations.observe({ operation: 'set', status: 'success' }, setDuration);
          }).catch((error) => {
            const setDuration = Date.now() - setStartTime;
            cacheOperations.observe({ operation: 'set', status: 'error' }, setDuration);
            console.error('Cache set error:', error);
          });
        }
        
        res.set('X-Cache-Status', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

