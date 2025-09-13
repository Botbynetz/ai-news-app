let Redis;
let redisClient = null;
const inMemory = new Map();

const SUMMARY_TTL = parseInt(process.env.SUMMARY_TTL || "86400", 10); // seconds

function initRedis() {
  if (redisClient || !process.env.REDIS_URL) return;
  try {
    Redis = require("ioredis");
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on("error", (e) => console.error("Redis error:", e));
  } catch (err) {
    console.warn("ioredis not available, falling back to in-memory cache");
    redisClient = null;
  }
}

initRedis();

async function getCached(key) {
  if (redisClient) {
    try {
      const v = await redisClient.get(key);
      return v ? JSON.parse(v) : null;
    } catch (err) {
      console.error("redis get error", err);
      return null;
    }
  }

  const entry = inMemory.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    inMemory.delete(key);
    return null;
  }
  return entry.value;
}

async function setCached(key, value, ttl = SUMMARY_TTL) {
  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttl);
      return true;
    } catch (err) {
      console.error("redis set error", err);
      return false;
    }
  }

  inMemory.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  return true;
}

module.exports = { getCached, setCached };
