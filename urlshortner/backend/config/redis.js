import Redis from "ioredis";

const clusterNodes = process.env.REDIS_CLUSTER_NODES;

export const redisClient = clusterNodes
  ? new Redis.Cluster(
      clusterNodes.split(",").map((address) => {
        const [host, port] = address.split(":");
        return { host, port: Number(port) };
      }),
      { lazyConnect: true },
    )
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
    });

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("ready", () => console.log("Redis client ready"));
redisClient.on("error", (error) => console.error("Redis error:", error));
