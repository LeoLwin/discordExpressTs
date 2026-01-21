"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moleculer_1 = require("moleculer");
const dotenv = __importStar(require("dotenv"));
const config_1 = __importDefault(require("../config/config"));
console.log("Initializing Service Broker with Redis transporter...");
dotenv.config();
console.log("Redis Config:", {
    host: config_1.default.redis.host,
    port: config_1.default.redis.port,
    password: config_1.default.redis.password,
});
let theBroker = new moleculer_1.ServiceBroker({
    namespace: "akarizen",
    nodeID: "endpont-node-1",
    logLevel: "info",
    transporter: {
        type: "Redis",
        options: {
            host: config_1.default.redis.host,
            port: Number(config_1.default.redis.port),
            password: config_1.default.redis.password,
            db: 0,
            // tls: {},
        },
    },
    cacher: {
        type: "Redis",
        options: {
            redis: {
                host: config_1.default.redis.host,
                port: Number(config_1.default.redis.port),
                password: config_1.default.redis.password,
                db: 0,
            },
        },
    },
    logger: true,
    created(broker) {
        broker.logger.info("created");
    },
    started(broker) {
        broker.logger.info("started");
    },
    stopped(broker) {
        broker.logger.info("stopped");
    },
});
exports.default = theBroker;
