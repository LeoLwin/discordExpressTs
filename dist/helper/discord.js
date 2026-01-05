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
exports.leaveGuild = exports.loginBots = exports.onBotMessage = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const redis_1 = __importDefault(require("../config/redis"));
// async function addMemberToChannel(channelId: string, memberId: string) {
//     try {
//         // Fetch the channel
//         const channel: Channel | null = await client.channels.fetch(channelId);
//         if (!channel) return console.log("Channel not found");
//         // Check if the channel is a GuildChannel (e.g., TextChannel, VoiceChannel)
//         if (channel instanceof GuildChannel) {
//             // Add permission overwrite for this member
//             await channel.permissionOverwrites.edit(memberId, {
//                 ViewChannel: true,        // allow them to see the channel
//                 SendMessages: true,       // allow them to send messages
//                 ReadMessageHistory: true  // allow them to read old messages
//             });
//             console.log(`Member ${memberId} now has access to channel ${channel.name}`);
//         } else {
//             console.log(`Channel ${channelId} is not a guild channel. Cannot modify permission overwrites.`);
//         }
//     } catch (error) {
//         console.error("Failed to add member to channel:", error);
//     }
// }
const botClients = [];
const botMessageCallbacks = new Map();
/**
 * Register a callback for a specific bot
 */
const onBotMessage = (botId, callback) => {
    var _a;
    if (!botMessageCallbacks.has(botId)) {
        botMessageCallbacks.set(botId, []);
    }
    (_a = botMessageCallbacks.get(botId)) === null || _a === void 0 ? void 0 : _a.push(callback);
};
exports.onBotMessage = onBotMessage;
const loginBots = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getDiscordData = yield redis_1.default.get("DiscordData");
        if (!getDiscordData)
            return [];
        const DiscordData = JSON.parse(getDiscordData);
        const clients = [];
        for (const item of DiscordData) {
            const botClient = new discord_js_1.Client({
                intents: [
                    discord_js_1.GatewayIntentBits.Guilds,
                    discord_js_1.GatewayIntentBits.GuildMessages,
                    discord_js_1.GatewayIntentBits.MessageContent,
                    discord_js_1.GatewayIntentBits.GuildMembers
                ]
            });
            botClient.once("ready", () => {
                var _a;
                console.log(`Bot logged in as ${(_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag}`);
            });
            botClient.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`Joined a new server: ${guild.name}`);
                console.log("Guild Details:", guild.channels);
                // console.log("guild.channels.cache : ", guild.channels.cache)
                console.log(`Server ID: ${guild.id}`);
                console.log(`Member count: ${guild.memberCount}`);
                console.log(`Owner ID`, guild.ownerId);
            }));
            // Optional: Listen to messages for this bot
            botClient.on("messageCreate", (message) => {
                var _a, _b, _c, _d;
                // botClient.user gives the bot itself
                const botTag = (_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag; // e.g., "KHL#8511"
                const botId = (_b = botClient.user) === null || _b === void 0 ? void 0 : _b.id; // e.g., "1446061847798218786"
                // message.guild gives the server the message came from
                const guildId = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.id; // e.g., "1457680812530208965"
                const guildName = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.name;
                const authorTag = message.author.tag; // who sent the message
                const content = message.content; // message content
                console.log(`[${botTag}] received a message in guild ${guildName} (${guildId}) from ${authorTag}: ${content}`);
            });
            yield botClient.login(item.botToken);
            clients.push(botClient);
            botClients.push(botClient); // store globally if needed
        }
        return clients;
    }
    catch (error) {
        console.error("Error logging in bots:", error);
        return [];
    }
});
exports.loginBots = loginBots;
// const loginBots = async () => {
//     try {
//         const getDiscordData = await redis.get("DiscordData");
//         if (!getDiscordData) return [];
//         const DiscordData: { botToken: string; cliedId: string; clientSecret: string }[] =
//             JSON.parse(getDiscordData);
//         const clients: Client[] = [];
//         for (const item of DiscordData) {
//             const botClient = new Client({
//                 intents: [
//                     GatewayIntentBits.Guilds,
//                     GatewayIntentBits.GuildMessages,
//                     GatewayIntentBits.MessageContent,
//                     GatewayIntentBits.GuildMembers
//                 ]
//             });
//             // Wait until bot is ready
//             await new Promise<void>((resolve) => {
//                 botClient.once("ready", () => {
//                     console.log(`Bot logged in as ${botClient.user?.tag}`);
//                     resolve();
//                 });
//             });
//             botClient.once("ready", () => {
//                 console.log(`Bot logged in as ${botClient.user?.tag}`);
//             });
//             botClient.on("guildCreate", async (guild) => {
//                 console.log(`Joined a new server: ${guild.name}`);
//                 console.log("Guild Details:", guild.channels);
//                 // console.log("guild.channels.cache : ", guild.channels.cache)
//                 console.log(`Server ID: ${guild.id}`);
//                 console.log(`Member count: ${guild.memberCount}`);
//                 console.log(`Owner ID`, guild.ownerId);
//             });
//             // Listen to messages
//             botClient.on("messageCreate", (message) => {
//                 if (message.author.bot) return;
//                 console.log(`[${botClient.user?.tag}] received message in ${message.guild?.name}: ${message.content}`);
//                 // Trigger all registered callbacks for this bot
//                 const callbacks = botMessageCallbacks.get(botClient.user?.id || "") || [];
//                 callbacks.forEach(cb => cb(botClient, message));
//             });
//             await botClient.login(item.botToken);
//             clients.push(botClient);
//             botClients.push(botClient);
//         }
//         return clients;
//     } catch (error) {
//         console.error("Error logging in bots:", error);
//         return [];
//     }
// };
const leaveGuild = (client, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const botClient = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === client.id; });
    try {
        if (!botClient) {
            console.log(`Bot with ID ${client.id} not found`);
            return false;
        }
        const guild = yield botClient.guilds.fetch(guildId);
        if (!guild) {
            console.log(`Guild with ID ${guildId} not found for bot ${(_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag}`);
            return false;
        }
        yield guild.leave();
        console.log(`Bot ${(_b = botClient.user) === null || _b === void 0 ? void 0 : _b.tag} left guild ${guild.name}`);
        return true;
    }
    catch (err) {
        console.error(`Error: Bot ${(_c = botClient === null || botClient === void 0 ? void 0 : botClient.user) === null || _c === void 0 ? void 0 : _c.tag} failed to leave guild:`, err);
        return false;
    }
});
exports.leaveGuild = leaveGuild;
