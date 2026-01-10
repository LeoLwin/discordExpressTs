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
exports.leaveGuild = exports.loginBots = exports.getServerInviteLink = exports.sendDMAsBot1 = exports.createChannelV2 = exports.getNamesById = exports.getIdByEmail = exports.sendFileToChannel = exports.sendMessageToChannel = exports.deletChannel = exports.createChannel = exports.loginBot2 = exports.logInBot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const redis_1 = __importDefault(require("../config/redis"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const axios_1 = __importDefault(require("axios"));
const createChannel = (channelName, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating channel with name:", channelName);
    let guild;
    const key = "DiscordData";
    const getData = yield redis_1.default.get(key);
    console.log("getData from Redis :", JSON.stringify(getData));
    if (!getData)
        throw new Error("No Discord data found in Redis");
    const DiscordData = JSON.parse(getData);
    const botInfo = DiscordData.find(d => d.guildId === guildId);
    console.log("botInfo :", botInfo);
    if (!botInfo)
        throw new Error("No bot found for the specified guildId");
    console.log("botClients :", botClients);
    guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
    console.log("Bot client found for guildId:", guild);
    if (!guild)
        throw new Error("Bot client not found");
    console.log("Guild fetched:", guild.id);
    const guildObj = guild.guilds.cache.get(guildId);
    if (!guildObj)
        throw new Error("Guild not found on bot client");
    const result = yield guildObj.channels.create({
        name: channelName,
        type: discord_js_1.ChannelType.GuildText,
    });
    console.log("Channel created:", result.name);
    const activeChatChannelskey = "ActiveChatChannels";
    const getActiveChatChannels = yield redis_1.default.get(activeChatChannelskey);
    let activeChatChannels = [];
    console.log("getActiveChatChannels :", getActiveChatChannels);
    if (getActiveChatChannels) {
        activeChatChannels = JSON.parse(getActiveChatChannels);
        activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }
    else {
        activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }
    yield redis_1.default.set(activeChatChannelskey, JSON.stringify(activeChatChannels));
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const getData = yield redis_1.default.get(activeChatChannelskey);
        console.log("Updated ActiveChatChannels from Redis:", getData);
    }), 2000);
    return result;
});
exports.createChannel = createChannel;
const deletChannel = (channelId, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Delete channel with channelId:", { channelId, guildId });
        let guild;
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        console.log("getData from Redis :", JSON.stringify(getData));
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        console.log("botClients :", botClients);
        guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        console.log("Bot client found for guildId:", guild);
        if (!guild)
            throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        const guildObj = guild.guilds.cache.get(guildId);
        if (!guildObj)
            throw new Error("Guild not found on bot client");
        const channel = yield guildObj.channels.fetch(channelId);
        if (!channel) {
            console.log("Channel not found!");
            return;
        }
        yield channel.delete();
        console.log(`Channel with ID ${channelId} deleted successfully.`);
        return `Channel with ID ${channelId} deleted successfully.`;
    }
    catch (error) {
        console.log("Error in deleteChannel :", error);
        return error.message;
    }
});
exports.deletChannel = deletChannel;
const sendMessageToChannel = (channelId, content, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Sending message to channelId:", { channelId, content, guildId });
        let guild;
        const key = "ActiveChatChannels";
        const getActiveChatChannels = yield redis_1.default.get(key);
        console.log("getData from Redis :", JSON.stringify(getActiveChatChannels));
        if (!getActiveChatChannels)
            throw new Error("No activeChatChannels data found in Redis");
        let activeChatChannels = [] =
            JSON.parse(getActiveChatChannels);
        const botInfo = activeChatChannels.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        console.log("botClients :", botClients);
        guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.botId; });
        console.log("Bot client found for guildId:", guild);
        if (!guild)
            throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        const guildObj = guild.guilds.cache.get(guildId);
        if (!guildObj)
            throw new Error("Guild not found on bot client");
        // Fetch the channel by ID
        const channel = yield guildObj.channels.fetch(channelId);
        if (!channel) {
            console.log("Channel not found!");
            return;
        }
        // Send the message
        yield channel.send(content);
        console.log(`Message sent to channel ${channel.name}`);
    }
    catch (err) {
        console.error("Error sending message:", err);
    }
});
exports.sendMessageToChannel = sendMessageToChannel;
const sendFileToChannel = (channelId, guildId, buffer, fileName, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("sendFileToChannel:", { channelId, guildId });
        const key = "ActiveChatChannels";
        const getActiveChatChannels = yield redis_1.default.get(key);
        if (!getActiveChatChannels) {
            throw new Error("No activeChatChannels data found in Redis");
        }
        const activeChatChannels = JSON.parse(getActiveChatChannels);
        const botInfo = activeChatChannels.find(d => d.guildId === guildId);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        // Find the correct bot client
        const client = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.botId; });
        if (!client)
            throw new Error("Bot client not found");
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            throw new Error("Guild not found on bot client");
        // Fetch channel
        const channel = yield guild.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            throw new Error("Channel not found or not text-based");
        }
        const message = yield channel.send({
            content: content,
            files: [{ attachment: buffer, name: fileName }]
        });
        console.log(`File sent to channel ${channelId}`);
        return message;
    }
    catch (err) {
        console.error("Error sending file:", err);
        return err.message;
    }
});
exports.sendFileToChannel = sendFileToChannel;
const validateBotCredentials = (creds) => __awaiter(void 0, void 0, void 0, function* () {
    // Check bot token
    const tokenClient = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
    try {
        yield tokenClient.login(creds.botToken);
        console.log(" Bot token is valid");
        tokenClient.destroy();
    }
    catch (err) {
        throw new Error(` Invalid bot token: ${err.message}`);
    }
});
const botClients = [];
const botMessageCallbacks = new Map();
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
                    discord_js_1.GatewayIntentBits.GuildMembers, // ✅ Needed for join events
                    discord_js_1.GatewayIntentBits.GuildMessages,
                    discord_js_1.GatewayIntentBits.MessageContent,
                    discord_js_1.GatewayIntentBits.DirectMessages // ✅ Needed for DMs
                ],
                partials: [discord_js_1.Partials.Channel] // ✅ Needed for DMs
            });
            botClient.once("ready", () => {
                var _a, _b, _c, _d;
                console.log(`Bot logged in as ${(_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag}`);
                console.log(`Bot ID   : ${(_b = botClient.user) === null || _b === void 0 ? void 0 : _b.id}`);
                console.log(`Bot Tag  : ${(_c = botClient.user) === null || _c === void 0 ? void 0 : _c.tag}`);
                const clientId = (_d = botClient.user) === null || _d === void 0 ? void 0 : _d.id;
                console.log("Client ID :", clientId);
            });
            botClient.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
                const botUser = botClient.user;
                console.log("===== BOT JOINED A SERVER =====");
                console.log(`Joined a new server: ${guild.name}`);
                console.log(`Bot Username : ${botUser === null || botUser === void 0 ? void 0 : botUser.tag}`);
                console.log(`Bot ID       : ${botUser === null || botUser === void 0 ? void 0 : botUser.id}`);
                console.log(`Server Name  : ${guild.name}`);
                console.log(`Server ID    : ${guild.id}`);
                console.log(`Member Count : ${guild.memberCount}`);
                console.log(`Owner ID     : ${guild.ownerId}`);
                const putTheGuildIdTotheClient = () => __awaiter(void 0, void 0, void 0, function* () {
                    console.log("-----------------------------------------------");
                    console.log("call putTheGuildIdTotheClient");
                    const key = "DiscordData";
                    const getData = yield redis_1.default.get(key);
                    let DiscordData = [];
                    console.log("getData :", getData);
                    if (getData) {
                        DiscordData = JSON.parse(getData);
                    }
                    console.log("type of botUser?.id :", typeof (botUser === null || botUser === void 0 ? void 0 : botUser.id));
                    DiscordData.map((d) => {
                        console.log("type of d.clientId :", typeof d.clientId);
                    });
                    const botInfo = DiscordData.find(d => d.clientId === (botUser === null || botUser === void 0 ? void 0 : botUser.id));
                    console.log("botInfo :", botInfo);
                    if (!botInfo)
                        return;
                    // Store single guildId
                    botInfo.guildId = guild.id;
                    yield redis_1.default.set(key, JSON.stringify(DiscordData));
                    console.log(`Saved guild ${guild.id} for bot ${botUser === null || botUser === void 0 ? void 0 : botUser.tag}`);
                    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                        const getData = yield redis_1.default.get(key);
                        console.log("Updated DiscordData from Redis:", getData);
                    }), 2000);
                });
                putTheGuildIdTotheClient();
            }));
            // Optional: Listen to messages for this bot
            botClient.on("messageCreate", (message) => {
                var _a, _b, _c, _d;
                // botClient.user gives the bot itself
                if (message.author.bot) {
                    console.log("Message from bot, ignoring.");
                    return;
                }
                ;
                const botTag = (_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag; // e.g., "KHL#8511"
                const botId = (_b = botClient.user) === null || _b === void 0 ? void 0 : _b.id; // e.g., "1446061847798218786"
                console.log("User message:", message.content);
                // message.guild gives the server the message came from
                const guildId = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.id; // e.g., "1457680812530208965"
                const guildName = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.name;
                const authorTag = message.author.tag; // who sent the message
                const content = message.content; // message content
                const channelId = message.channel.id;
                console.log("Channel ID  :", channelId);
                const sendMessage = (channelId, botId, guildId) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log("-----------------------------------------------");
                    console.log("call sendMessage");
                    const key = "ActiveChatChannels";
                    const getActiveChatChannels = yield redis_1.default.get(key);
                    let activeChatChannels = [];
                    console.log("getActiveChatChannels :", getActiveChatChannels);
                    if (getActiveChatChannels) {
                        activeChatChannels = JSON.parse(getActiveChatChannels);
                        const channelInfo = activeChatChannels.find(ac => ac.channelId === channelId && ac.botId === botId && ac.guildId === guildId);
                        if (!channelInfo) {
                            console.log("No matching active chat channel found. Ignoring message.");
                            return;
                        }
                        console.log("channelInfo :", channelInfo);
                        console.log("To reply  to the other platform");
                        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
                    }
                    else {
                        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
                    }
                });
                sendMessage(channelId, botId, guildId);
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
const logInBot = (botToken, clientId, clientSecret) => __awaiter(void 0, void 0, void 0, function* () {
    // const clients: Client[] = [];
    // Validate credentials first
    yield validateBotCredentials({ botToken, clientId, clientSecret });
    const botClient = new discord_js_1.Client({
        intents: [
            discord_js_1.GatewayIntentBits.Guilds, // Required for guild info
            discord_js_1.GatewayIntentBits.GuildMembers, // ✅ Required to detect joins
            discord_js_1.GatewayIntentBits.DirectMessages, // Required if you want to DM users
            discord_js_1.GatewayIntentBits.GuildMessages,
            discord_js_1.GatewayIntentBits.MessageContent
        ],
        partials: [discord_js_1.Partials.Channel] // Required to send DMs
    });
    botClient.once("ready", () => {
        var _a, _b, _c, _d;
        console.log(`Bot logged in as ${(_a = botClient.user) === null || _a === void 0 ? void 0 : _a.tag}`);
        console.log(`Bot ID   : ${(_b = botClient.user) === null || _b === void 0 ? void 0 : _b.id}`);
        console.log(`Bot Tag  : ${(_c = botClient.user) === null || _c === void 0 ? void 0 : _c.tag}`);
        const clientId = (_d = botClient.user) === null || _d === void 0 ? void 0 : _d.id;
        console.log("Client ID :", clientId);
    });
    botClient.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
        const botUser = botClient.user;
        console.log("===== BOT JOINED A SERVER =====");
        console.log(`Joined a new server: ${guild.name}`);
        console.log(`Bot Username : ${botUser === null || botUser === void 0 ? void 0 : botUser.tag}`);
        console.log(`Bot ID       : ${botUser === null || botUser === void 0 ? void 0 : botUser.id}`);
        console.log(`Server Name  : ${guild.name}`);
        console.log(`Server ID    : ${guild.id}`);
        console.log(`Member Count : ${guild.memberCount}`);
        console.log(`Owner ID     : ${guild.ownerId}`);
        yield putTheGuildIdTotheClient(botUser, guild.id);
    }));
    botClient.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        // botClient.user gives the bot itself
        if (message.author.bot) {
            console.log("Message from bot, ignoring.");
            return;
        }
        ;
        if (message.channel.isDMBased()) {
            console.log("DM received:", {
                from: message.author.tag,
                userId: message.author.id,
                content: message.content,
                chatId: message.channel.id
            });
            const chatId = message.channel.id;
            const text = message.content;
            let attachmentUrl;
            let attachmentType;
            let attachmentName;
            const attachment = message.attachments.first();
            if (attachment) {
                attachmentUrl = attachment.url;
                attachmentType = (_b = (_a = attachment.contentType) === null || _a === void 0 ? void 0 : _a.split("/")[0]) !== null && _b !== void 0 ? _b : null;
                attachmentName = attachment.name;
                console.log("Attachment info:", {
                    name: attachment.name,
                    url: attachment.url,
                    size: attachment.size,
                    contentType: attachment.contentType
                });
            }
            console.log("DM received:", {
                from: message.author.tag,
                userId: message.author.id,
                content: text,
                attachmentType,
                attachmentUrl
            });
            // Reply back
            yield message.reply("Thanks for your message! We’ll get back to you soon.");
            yield message.author.send("Thanks for your message! We’ll get back to you soon.");
        }
        // const botTag = botClient.user?.tag;   // e.g., "KHL#8511"
        // const botId = botClient.user?.id;     // e.g., "1446061847798218786"
        // console.log("User message:", message.content);
        // // message.guild gives the server the message came from
        // const guildId = message.guild?.id;    // e.g., "1457680812530208965"
        // const guildName = message.guild?.name;
        // const authorTag = message.author.tag; // who sent the message
        // const content = message.content;      // message content
        // const channelId = message.channel.id;
        // if (message.attachments.size > 0) {
        //     console.log(`This message has ${message.attachments.size} attachment(s)`);
        //     message.attachments.forEach(async attachment => {
        //         console.log("Attachment info:", {
        //             name: attachment.name,
        //             url: attachment.url,
        //             size: attachment.size,
        //             contentType: attachment.contentType
        //         });
        //         // attachmentType = attachment.contentType;
        //         // attachmentUrl = attachment.url
        //         // Optional: Download the file if needed
        //         // const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
        //         // const fileBuffer = Buffer.from(response.data);
        //         // console.log(`Downloaded file ${attachment.name} (${fileBuffer.length} bytes)`);
        //     });
        // }
        // // Log basic message info
        // const userId = message.author.id;        // Discord user ID
        // const username = message.author.username; // Username (without discriminator)
        // const userTag = message.author.tag;
        // let attachmentUrl: string | undefined;
        // let attachmentType: string | null | undefined;
        // let attachmentName: string | undefined;
        // const attachment = message.attachments.first();
        // console.log("attachment : ", attachment)
        // if (attachment) {
        //     attachmentUrl = attachment.url;
        //     attachmentType = attachment.contentType?.split("/")[0] ?? null;
        //     attachmentName = attachment.name
        // }
        // console.log("Message received:", {
        //     channel: message.channel.id,
        //     userId,
        //     username,
        //     userTag,
        //     content: message.content,
        //     attachmentUrl,
        //     attachmentType,
        //     attachmentName
        // });
        // // console.log("File Split : ", attachmentType?.split("/")[0])
        // const para = {
        //     userId,
        //     username: username,
        //     chatId: message.channel.id,
        //     text: message.content
        // };
        // if (message.attachments.size > 0) {
        //     console.log(`This message has ${message.attachments.size} attachment(s)`);
        //     message.attachments.forEach(async attachment => {
        //         console.log("Attachment info:", {
        //             name: attachment.name,
        //             url: attachment.url,
        //             size: attachment.size,
        //             contentType: attachment.contentType
        //         });
        //         // attachmentType = attachment.contentType;
        //         // attachmentUrl = attachment.url
        //         // Optional: Download the file if needed
        //         // const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
        //         // const fileBuffer = Buffer.from(response.data);
        //         // console.log(`Downloaded file ${attachment.name} (${fileBuffer.length} bytes)`);
        //     });
        // }
        // sendMessage(channelId, botId!, guildId!);
        // console.log(`[${botTag}] received a message in guild ${guildName} (${guildId}) from ${authorTag}: ${content}`);
    }));
    botClient.on("guildMemberAdd", (member) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield member.send(`Welcome to ${member.guild.name}!`);
        }
        catch (_a) {
            const channel = member.guild.systemChannel; // Default system channel
            if (channel)
                channel.send(`Welcome to the server, ${member.user.tag}!`);
        }
    }));
    yield botClient.login(botToken);
    // clients.push(botClient);
    botClients.push(botClient);
    return botClient;
});
exports.logInBot = logInBot;
const loginBot2 = (botToken, clientId, clientSecret) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const client = new discord_js_1.Client({
                intents: [
                    discord_js_1.GatewayIntentBits.Guilds,
                    discord_js_1.GatewayIntentBits.GuildMessages,
                    discord_js_1.GatewayIntentBits.MessageContent
                ]
            });
            client.on("error", (error) => {
                console.log("Discord client error:", error);
                resolve(responseStatus_1.default.UNKNOWN(`Discord client error: ${error.message}`));
            });
            client.once("clientReady", () => {
                const botId = client.user.id;
                console.log(`Logged in: ${client.user.tag}`);
                resolve(responseStatus_1.default.OK("Bot logged in successfully."));
                console.log("Storing client for botId:", botId);
                // clients.set(botId, client);
            });
            client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c;
                try {
                    // Ignore bot messages
                    if (message.author.bot)
                        return;
                    // Only messages in a guild
                    if (!message.guild)
                        return;
                    // Handle text content
                    if (message.content) {
                        // Example command
                        if (message.content === "!ping") {
                            yield message.reply("pong");
                        }
                        // Any other text handling
                        console.log("Text message:", message.content);
                    }
                    const text = message.content;
                    let attachmentUrl;
                    let attachmentType;
                    let attachmentName;
                    //  Handle attachments (files/images/etc.)
                    if (message.attachments.size > 0) {
                        console.log(`This message has ${message.attachments.size} attachment(s)`);
                        message.attachments.forEach((attachment) => __awaiter(void 0, void 0, void 0, function* () {
                            console.log("Attachment info:", {
                                name: attachment.name,
                                url: attachment.url,
                                size: attachment.size,
                                contentType: attachment.contentType
                            });
                            // attachmentType = attachment.contentType;
                            // attachmentUrl = attachment.url
                            // Optional: Download the file if needed
                            // const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
                            // const fileBuffer = Buffer.from(response.data);
                            // console.log(`Downloaded file ${attachment.name} (${fileBuffer.length} bytes)`);
                        }));
                    }
                    // Log basic message info
                    const userId = message.author.id; // Discord user ID
                    const username = message.author.username; // Username (without discriminator)
                    const userTag = message.author.tag;
                    const attachment = message.attachments.first();
                    console.log("attachment : ", attachment);
                    if (attachment) {
                        attachmentUrl = attachment.url;
                        attachmentType = (_b = (_a = attachment.contentType) === null || _a === void 0 ? void 0 : _a.split("/")[0]) !== null && _b !== void 0 ? _b : null;
                        ;
                        attachmentName = attachment.name;
                    }
                    console.log("Message received:", {
                        bot: (_c = client.user) === null || _c === void 0 ? void 0 : _c.tag,
                        guild: message.guild.name,
                        channel: message.channel.id,
                        userId,
                        username,
                        userTag,
                        content: message.content,
                        attachmentUrl,
                        attachmentType,
                        attachmentName
                    });
                }
                catch (err) {
                    console.error("Error handling message:", err);
                }
            }));
            // await client.login(creds.botToken);
        }
        catch (error) {
            console.log("Error logging in bot:", error.message);
            resolve(responseStatus_1.default.UNKNOWN(`Error logging in bot: ${error.message}`));
        }
    }));
});
exports.loginBot2 = loginBot2;
const sendMessage = (channelId, botId, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("-----------------------------------------------");
    console.log("call sendMessage");
    const key = "ActiveChatChannels";
    const getActiveChatChannels = yield redis_1.default.get(key);
    let activeChatChannels = [];
    console.log("getActiveChatChannels :", getActiveChatChannels);
    if (getActiveChatChannels) {
        activeChatChannels = JSON.parse(getActiveChatChannels);
        const channelInfo = activeChatChannels.find(ac => ac.channelId === channelId && ac.botId === botId && ac.guildId === guildId);
        if (!channelInfo) {
            console.log("No matching active chat channel found. Ignoring message.");
            return;
        }
        console.log("channelInfo :", channelInfo);
        console.log("To reply  to the other platform");
        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }
    else {
        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }
});
const putTheGuildIdTotheClient = (botUser, guildId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("-----------------------------------------------");
    console.log("call putTheGuildIdTotheClient");
    const key = "DiscordData";
    const getData = yield redis_1.default.get(key);
    let DiscordData = [];
    console.log("getData :", getData);
    if (getData) {
        DiscordData = JSON.parse(getData);
    }
    console.log("type of botUser?.id :", typeof (botUser === null || botUser === void 0 ? void 0 : botUser.id));
    DiscordData.map((d) => {
        console.log("type of d.clientId :", typeof d.clientId);
    });
    const botInfo = DiscordData.find(d => d.clientId === (botUser === null || botUser === void 0 ? void 0 : botUser.id));
    console.log("botInfo :", botInfo);
    if (!botInfo)
        return;
    // Store single guildId
    botInfo.guildId = guildId;
    yield redis_1.default.set(key, JSON.stringify(DiscordData));
    console.log(`Saved guild ${guildId} for bot ${botUser === null || botUser === void 0 ? void 0 : botUser.tag}`);
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const getData = yield redis_1.default.get(key);
        console.log("Updated DiscordData from Redis:", getData);
    }), 2000);
});
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
//  const createPrivateChannel = async (channelName: string, allowedMemberIds: string[] = []) => {
const getIdByEmail = (guildId, agentNames) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Get Names from email:", agentNames);
        let guild;
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        console.log("getData from Redis :", JSON.stringify(getData));
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        // console.log("botClients :", botClients?[0].user.id);
        guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        console.log("Bot client found for guildId:", guild);
        if (!guild)
            throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        const guildObj = guild.guilds.cache.get(guildId);
        if (!guildObj)
            throw new Error("Guild not found on bot client");
        // Fetch all members of the guild (make sure your bot has the GUILD_MEMBERS intent!)
        yield guildObj.members.fetch();
        console.log("UserNames : ", guildObj.members.cache);
        // Map agentNames to their user IDs
        const userIds = agentNames.map(name => {
            const member = guildObj.members.cache.find((m) => m.user.username === name);
            return member ? member.user.id : null;
        }).filter(id => id !== null);
        return userIds; // array of user IDs
    }
    catch (error) {
        console.log("Error on getIdByEmail:", error.message);
        return [];
    }
});
exports.getIdByEmail = getIdByEmail;
const getNamesById = (guildId, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Get agentNames from id:", { guildId, agentId });
        let guild;
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        console.log("getData from Redis :", JSON.stringify(getData));
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        // console.log("botClients :", botClients?[0].user.id);
        guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        console.log("Bot client found for guildId:", guild);
        if (!guild)
            throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        const guildObj = guild.guilds.cache.get(guildId);
        if (!guildObj)
            throw new Error("Guild not found on bot client");
        // Fetch all members of the guild (make sure your bot has the GUILD_MEMBERS intent!)
        yield guildObj.members.fetch();
        yield guildObj.members.fetch();
        const member = guildObj.members.cache.get(agentId); // get member by userId
        if (member) {
            console.log("Username:", member.user.username); // e.g., "Test1"
            console.log("Full tag:", member.user.tag); // e.g., "Test1#1234"
            return { name: member.user.username, tag: member.user.tag };
        }
        else {
            console.log("Member not found in guild");
            return 'NO user found.';
        }
    }
    catch (error) {
        console.log("Error on getIdByEmail:", error.message);
        return [];
    }
});
exports.getNamesById = getNamesById;
const createChannelV2 = (guildId, name, allowedUserIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("Get agentNames from id:", { guildId, agentId });
        let guild;
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        console.log("getData from Redis :", JSON.stringify(getData));
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        console.log("discrdData : ", DiscordData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        // console.log("botClients :", botClients?[0].user.id);
        guild = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        console.log("Bot client found for guildId:", guild);
        if (!guild)
            throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        // const guildObj = guild.guilds.cache.get(guildId);
        // if (!guildObj) throw new Error("Guild not found on bot client");
        // const guild = client.guilds.cache.get(guildId);
        guild = yield guild.guilds.fetch(guildId);
        // if (!guild) throw new Error("Guild not found");
        yield guild.members.fetch();
        // const permissionOverwrites = [
        //     {
        //         id: guild.roles.everyone.id, // @everyone role
        //         deny: [PermissionsBitField.Flags.ViewChannel] // deny view for everyone
        //     },
        //     ...allowedUserIds.map(userId => ({
        //         id: userId,
        //         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] // allow access
        //     }))
        // ];
        const permissionOverwrites = [
            {
                id: guild.roles.everyone.id,
                type: discord_js_1.OverwriteType.Role,
                deny: [discord_js_1.PermissionsBitField.Flags.ViewChannel],
            },
            ...allowedUserIds.map(userId => ({
                id: userId,
                type: discord_js_1.OverwriteType.Member,
                allow: [
                    discord_js_1.PermissionsBitField.Flags.ViewChannel,
                    discord_js_1.PermissionsBitField.Flags.SendMessages,
                ],
            })),
        ];
        const channel = yield guild.channels.create({
            name: name,
            type: discord_js_1.ChannelType.GuildText,
            permissionOverwrites
        });
        console.log(`Channel created: ${channel.name} (${channel.id})`);
        return responseStatus_1.default.OK(channel);
    }
    catch (err) {
        // Catch any error
        console.error("Error creating channel:", err.message || err);
        // Optionally return null or throw again
        return responseStatus_1.default.UNKNOWN(err.message);
    }
});
exports.createChannelV2 = createChannelV2;
const getServerInviteLink = (guildId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        const client = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        if (!client)
            throw new Error("Bot client not found");
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            throw new Error("Guild not found for the bot");
        console.log("Guild fetched:", guild.id);
        // Try fetching existing invites
        const invites = yield guild.invites.fetch();
        if (invites.size > 0) {
            return invites.first().url;
        }
        // Create new invite
        const channel = guild.channels.cache.find((ch) => {
            var _a;
            return (ch.isTextBased() && !ch.isThread()) &&
                ((_a = ch.permissionsFor(guild.members.me)) === null || _a === void 0 ? void 0 : _a.has(discord_js_1.PermissionsBitField.Flags.CreateInstantInvite));
        });
        if (!channel)
            return null;
        const invite = yield channel.createInvite({
            maxAge: 0,
            maxUses: 0,
            unique: true
        });
        return invite.url;
    }
    catch (error) {
        console.error("Error creating server invite:", error);
        return null;
    }
});
exports.getServerInviteLink = getServerInviteLink;
const sendMessageAsBot0 = (params) => __awaiter(void 0, void 0, void 0, function* () {
    let { guildId, text: content, attachmentUrl, filename, chatId } = params;
    // const channelId = ""
    try {
        const key = "DiscordData";
        const getData = yield redis_1.default.get(key);
        if (!getData)
            throw new Error("No Discord data found in Redis");
        const DiscordData = JSON.parse(getData);
        const botInfo = DiscordData.find(d => d.guildId === guildId);
        if (!botInfo)
            throw new Error("No bot found for the specified guildId");
        const client = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === botInfo.clientId; });
        if (!client)
            throw new Error("Bot client not found");
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            throw new Error("Guild not found for the bot");
        console.log("Guild fetched:", guild.id);
        const channel = yield guild.channels.fetch(chatId);
        if (attachmentUrl) {
            if (!filename)
                filename = new URL(attachmentUrl).pathname.split('/').pop();
            const response = yield axios_1.default.get(attachmentUrl, { responseType: 'arraybuffer' });
            const fileBuffer = Buffer.from(response.data, 'binary');
            yield channel.send({ content, files: [{ attachment: fileBuffer, name: filename }] });
        }
        else {
            yield channel.send(content);
        }
        return responseStatus_1.default.OK("Message Send Succesfully.");
    }
    catch (err) {
        // Catch any error
        console.error("Error creating channel:", err.message || err);
        // Optionally return null or throw again
        return responseStatus_1.default.UNKNOWN(err.message);
    }
});
const sendDMAsBot1 = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { clientId, userId, text, attachmentUrl, filename } = params;
        const client = botClients.find(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a.id) === clientId; });
        if (!client)
            throw new Error("Bot client not found");
        // 1. Fetch user
        const user = yield client.users.fetch(userId);
        // 2. Create / get DM channel
        const dmChannel = yield user.createDM();
        // 3. Send message
        if (attachmentUrl) {
            const name = (_a = filename !== null && filename !== void 0 ? filename : new URL(attachmentUrl).pathname.split("/").pop()) !== null && _a !== void 0 ? _a : "file";
            const response = yield axios_1.default.get(attachmentUrl, {
                responseType: "arraybuffer",
                validateStatus: () => true
            });
            if (!response.data || response.data.byteLength === 0) {
                throw new Error("Downloaded attachment is empty");
            }
            const attachment = new discord_js_1.AttachmentBuilder(Buffer.from(response.data), { name });
            yield dmChannel.send({
                content: text,
                files: [attachment]
            });
        }
        else {
            yield dmChannel.send(text);
        }
        return responseStatus_1.default.OK("DM sent successfully");
    }
    catch (err) {
        console.error("Error sending DM:", err);
        return responseStatus_1.default.UNKNOWN(err.message);
    }
});
exports.sendDMAsBot1 = sendDMAsBot1;
// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildMembers
//     ]
// });
// client.on("ready", async () => {
//     if (!client.user) return;
//     console.log(`Bot logged in as ${client.user.tag}`);
//     console.log(`Logged in as ${client.user.tag}`);
//     try {
//         console.log("Started registering slash commands...");
//         // await rest.put(
//         //     Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
//         //     { body: [verifyCommand.toJSON()] }
//         // );
//         console.log("Successfully registered slash commands!");
//     } catch (error) {
//         console.error("Error registering commands:", error);
//     }
// });
// client.on("guildCreate", async (guild) => {
//     console.log(`Joined a new server: ${guild.name}`);
//     console.log("Guild Details:", guild.channels);
//     // console.log("guild.channels.cache : ", guild.channels.cache)
//     console.log(`Server ID: ${guild.id}`);
//     console.log(`Member count: ${guild.memberCount}`);
//     console.log(`Owner ID`, guild.ownerId);
//     try {
//         // Fetch all channels from the guild
//         await guild.channels.fetch(); // ensures cache is populated
//         // Map channels to an array of {id, name}
//         const channelList = guild.channels.cache.map(ch => ({
//             id: ch.id,
//             name: ch.name
//         }));
//         console.log("channelList : ", channelList);
//         const allowedDiscordBusinessId = [{
//             "id": "1457606313465876542",
//             "name": "wersg3"
//         }]
//         const isAllowed = allowedDiscordBusinessId.find(item =>
//             channelList.some(ch => ch.name === item.name)
//         );
//         const getGeneralChannel = channelList.find(ch => ch.name === "general" || ch.name === "general-chat");
//         console.log("getGeneralChannel :", getGeneralChannel);
//         console.log("isAllowed:", isAllowed);
//         // if (!isAllowed) {
//         if (isAllowed) {
//             const leaveMessage = `⚠️ It looks like this server isn't registered on the Akarizen platform.
//             I won't be able to stay here unless the server completes the registration process.`;
//             // await sendMessageToChannel(getGeneralChannel.id, leaveMessage);
//             console.log(`Server ${guild.name} did not verify in time. Leaving...`);
//             guild.leave().catch(console.error);
//             return;
//         }
//         const discordBusinessChannel = channelList.find(ch => ch.name === "wersg3");
//         // await deleteChannel(discordBusinessChannel.id);
//         // await deleteChannel(isAllowed.id);
//         const welcomeMessage = `👋Hello! Thanks for adding me to your server.
//         I’m all set and ready to assist you with managing your server and making things smoother.`;
//         // await sendMessageToChannel(getGeneralChannel.id, welcomeMessage);
//         console.log("Data: ", {
//             guildId: guild.id,
//             guildName: guild.name,
//             ownerId: guild.ownerId,
//             memberCount: guild.memberCount,
//             channelCount: channelList.length
//         })
//     } catch (err) {
//         console.error("Error fetching channels:", err);
//     }
//     // try {
//     //     console.log("Started registering slash commands...");
//     //     await rest.put(
//     //         Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
//     //         { body: [verifyCommand.toJSON()] }
//     //     );
//     //     console.log("Successfully registered slash commands!");
//     // } catch (error) {
//     //     console.error("Error registering commands:", error);
//     // }
//     // Step 1: Notify the server owner to verify
//     // try {
//     //     // const guild = await client.guilds.fetch(guildId);
//     //     const owner = await guild.fetchOwner(); // fetch the server owner
//     //     owner.send(`Hi! Please verify your server using /verify <code> within 1 minute, or I will leave the server.`)
//     //         .catch(() => console.log("Couldn't DM the owner."));
//     // } catch (err) {
//     //     console.log("Error fetching owner:", err);
//     // }
//     // // Step 2: Set a 1 minute timeout
//     // setTimeout(async () => {
//     //     // Check if guild is verified in your DB
//     //     // const record = await db.guilds.findOne({ guildId: guild.id, verified: true });
//     //     const record = false; // Placeholder for actual DB check
//     //     if (!record) {
//     //         console.log(`Server ${guild.name} did not verify in time. Leaving...`);
//     //         guild.leave().catch(console.error);
//     //     } else {
//     //         console.log(`Server ${guild.name} is verified, no action needed.`);
//     //     }
//     // }, 60 * 1000); // 1 minute = 60000 ms
// });
// // Listen for messages
// client.on("messageCreate", (message) => {
//     console.log("message : ", message)
//     console.log(`Message from ${message.author.username}: ${message.content}`);
//     if (message.content === "!hello") {
//         message.reply("Hello from Express + Discord Bot!");
//     }
//     if (message.attachments.size > 0) {
//         message.attachments.forEach((attachment) => {
//             console.log("Attachment found!");
//             console.log("Filename:", attachment.name);
//             console.log("URL:", attachment.url);
//             console.log("Content type:", attachment.contentType); // sometimes available
//         });
//     }
// });
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
// async function createPrivateChannel(channelName: string, allowedMemberIds: string[] = []) {
//     if (!process.env.GUILD_ID) {
//         throw new Error("GUILD_ID is not defined in environment variables");
//     }
//     const guild = await client.guilds.fetch(process.env.GUILD_ID);
//     // Set permissions: deny @everyone
//     const permissionOverwrites: { id: string; allow?: bigint[]; deny?: bigint[] }[] = [
//         {
//             id: guild.roles.everyone.id,
//             deny: [PermissionFlagsBits.ViewChannel]
//         }
//     ];
//     // Give access to selected members
//     allowedMemberIds.forEach(id => {
//         permissionOverwrites.push({
//             id: id,
//             allow: [
//                 PermissionFlagsBits.ViewChannel,
//                 PermissionFlagsBits.SendMessages,
//                 PermissionFlagsBits.ReadMessageHistory
//             ]
//         });
//     });
//     // Optionally, allow admins to view the channel
//     const adminRole = guild.roles.cache.find(role =>
//         role.permissions.has(PermissionFlagsBits.Administrator)
//     );
//     if (adminRole) {
//         permissionOverwrites.push({
//             id: adminRole.id,
//             allow: [
//                 PermissionFlagsBits.ViewChannel,
//                 PermissionFlagsBits.SendMessages,
//                 PermissionFlagsBits.ReadMessageHistory
//             ]
//         });
//     }
//     // Create the private text channel
//     const channel = await guild.channels.create({
//         name: channelName,
//         type: ChannelType.GuildText,
//         permissionOverwrites: permissionOverwrites
//     });
//     console.log("Private channel created:", channel.name);
//     return channel;
// }
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
