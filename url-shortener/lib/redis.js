import IOredis from "ioredis";

const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || "redis://default@127.0.0.1:6379";
  return new IOredis(redisUrl)
};

const globalForRedis = global;

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
