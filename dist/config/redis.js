"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("./config"));
const redis = new ioredis_1.default({
    host: config_1.default.redis.host,
    port: Number(config_1.default.redis.port),
    password: config_1.default.redis.password,
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
exports.default = redis;
