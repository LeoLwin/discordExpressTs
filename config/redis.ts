import Redis from "ioredis";
import config from "./config";

const redis = new Redis({
    host: config.redis.host,
    port: Number(config.redis.port),
    password: config.redis.password,

    // Recommended for microservices
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
});

redis.on("connect", () => {
    console.log("Redis connected: to save the data  ");
});

redis.on("ready", () => {
    console.log(" Redis ready to use");
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

export default redis;