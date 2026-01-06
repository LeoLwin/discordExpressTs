"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = require("express").Router();
const express_1 = __importDefault(require("express"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const discord_1 = require("../helper/discord");
const redis_1 = __importDefault(require("../config/redis"));
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/", (req, res) => {
    res.send("Welcome to the discord controller ");
});
// router.get("/list", async (req: Request, res: Response) => {
//   try {
//     const { current, limit, role } = req.body;
//     console.log("req.body :", req.body);
//     if (!current || !limit) {
//       return res.json({ message: "Invalid parameters" })
//     }
//     const result: any = await ServiceBroker.call("blog.list", { current, limit });
//     console.log("Result : ", result);
//     res.json({ result });
//   } catch (err) {
//     handleError(res, err as Error);
//   }
// });
router.post("/addDiscordData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { botToken, clientId, clientSecret } = req.body;
        if (!botToken || !clientId || !clientSecret) {
            return res.json(responseStatus_1.default.UNKNOWN("Missing parameters"));
        }
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        let DiscordData = [];
        if (getData) {
            DiscordData = JSON.parse(getData);
            // Avoid duplicate botToken
            if (DiscordData.some(d => d.botToken === botToken)) {
                return res.json(responseStatus_1.default.OK("Discord Agent already exists"));
            }
        }
        DiscordData.push({ botToken, clientId, clientSecret });
        yield redis_1.default.set(key, JSON.stringify(DiscordData));
        const addBotToTheServerURL = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        console.log("Updated DiscordData in Redis:", DiscordData);
        res.json(responseStatus_1.default.OK(addBotToTheServerURL, "Discord Agent added successfully"));
    }
    catch (err) {
        console.error("Error in /addDiscordData:", err);
        res.json(responseStatus_1.default.UNKNOWN(err instanceof Error ? err.message : "Unknown error"));
    }
}));
router.post("/create-channel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, guildId } = req.body;
        console.log("req.body:", req.body);
        const channel = yield (0, discord_1.createChannel)(name, guildId);
        // console.log("channel create : ", channel)
        // console.log('hello')
        res.json({ success: true, channelId: channel.id });
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/deleteAllbots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.default.del(`DiscordData`);
        yield redis_1.default.del(`ActiveChatChannels`);
        res.json(responseStatus_1.default.OK("All bots deleted successfully"));
    }
    catch (err) {
        console.log("err in deleteAllbots :", err);
        handleError(res, err);
    }
}));
router.get("/loginBots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("loginBots called");
        const clients = yield (0, discord_1.loginBots)(); // array of Client instances
        // Map clients to a safe JSON response
        const result = clients.map(c => {
            var _a, _b;
            return ({
                tag: (_a = c.user) === null || _a === void 0 ? void 0 : _a.tag,
                id: (_b = c.user) === null || _b === void 0 ? void 0 : _b.id.toString() // convert BigInt to string
            });
        });
        res.json(responseStatus_1.default.OK(result, "Bots logged in successfully"));
    }
    catch (err) {
        console.log("err in loginBots :", err);
        handleError(res, err);
    }
}));
router.get("/getAllbots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getDiscordData = yield redis_1.default.get(`DiscordData`);
        res.json(responseStatus_1.default.OK("All bots fetched successfully", JSON.parse(getDiscordData || '[]')));
    }
    catch (err) {
        console.log("err in getAllbots :", err);
        handleError(res, err);
    }
}));
router.post("/leaveGuild", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { client, guildId } = req.body;
        console.log("Leave Guild req.body:", req.body);
        if (!guildId) {
            return res.json(responseStatus_1.default.UNKNOWN("Missing guildId parameter"));
        }
        const result = yield (0, discord_1.leaveGuild)(client, guildId);
        console.log("deleteAllbots : ", result);
        if (result) {
            res.json(responseStatus_1.default.OK("Bot left the guild successfully"));
        }
        else {
            res.json(responseStatus_1.default.UNKNOWN("Failed to leave the guild"));
        }
    }
    catch (err) {
        console.log("err in leaveGuild :", err);
        handleError(res, err);
    }
}));
router.post("/sendMessageToChannel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { channelId, guildId, content } = req.body;
        const result = yield (0, discord_1.sendMessageToChannel)(channelId, content, guildId);
        res.json(responseStatus_1.default.OK(result, "Message sent successfully"));
    }
    catch (err) {
        console.log("err in sendMessageToChannel :", err);
        handleError(res, err);
    }
}));
router.get("/getActiveChatChannels", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getActiveChatChannels = yield redis_1.default.get(`ActiveChatChannels`);
        res.json(responseStatus_1.default.OK("Active chat channels fetched successfully", JSON.parse(getActiveChatChannels || '[]')));
    }
    catch (err) {
        console.log("err in getActiveChatChannels :", err);
        handleError(res, err);
    }
}));
exports.default = router;
