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
exports.leaveGuild = exports.loginBots = exports.sendFileToChannel = exports.sendMessageToChannel = exports.deletChannel = exports.createChannel = exports.logInBot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const redis_1 = __importDefault(require("../config/redis"));
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
                    discord_js_1.GatewayIntentBits.GuildMessages,
                    discord_js_1.GatewayIntentBits.MessageContent,
                    discord_js_1.GatewayIntentBits.GuildMembers
                ]
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
const logInBot = (botToken) => __awaiter(void 0, void 0, void 0, function* () {
    // const clients: Client[] = [];
    const botClient = new discord_js_1.Client({
        intents: [
            discord_js_1.GatewayIntentBits.Guilds,
            discord_js_1.GatewayIntentBits.GuildMessages,
            discord_js_1.GatewayIntentBits.MessageContent,
            discord_js_1.GatewayIntentBits.GuildMembers
        ]
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
        sendMessage(channelId, botId, guildId);
        console.log(`[${botTag}] received a message in guild ${guildName} (${guildId}) from ${authorTag}: ${content}`);
    });
    yield botClient.login(botToken);
    // clients.push(botClient);
    botClients.push(botClient);
    return botClient;
});
exports.logInBot = logInBot;
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
