import { createClient } from "redis";

// Подключение к Redis (запущен в Docker на порту 6379)
export const redisClient = createClient({ url: "redis://127.0.0.1:6379" });

redisClient.on("error", (err) => console.error("Redis error:", err));

export async function initRedis() {
  await redisClient.connect();
  console.log("Redis подключён");
}

export function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = await redisClient.get(key);

      if (cached) {
        return res.json({ source: "cache", data: JSON.parse(cached) });
      }

      req.cacheKey = key;
      req.cacheTTL = ttl;
      next();
    } catch (err) {
      console.error("Ошибка чтения кэша:", err);
      next();
    }
  };
}

export async function saveToCache(key, data, ttl) {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (err) {
    console.error("Ошибка записи в кэш:", err);
  }
}

export async function invalidateUsersCache(userId = null) {
  try {
    await redisClient.del("users:all");
    if (userId) await redisClient.del(`users:${userId}`);
  } catch (err) {
    console.error("Ошибка инвалидации кэша пользователей:", err);
  }
}

export async function invalidateProductsCache(productId = null) {
  try {
    await redisClient.del("products:all");
    if (productId) await redisClient.del(`products:${productId}`);
  } catch (err) {
    console.error("Ошибка инвалидации кэша товаров:", err);
  }
}
