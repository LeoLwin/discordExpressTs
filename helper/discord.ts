import dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, Message } from "discord.js";
import redis from "../config/redis";

const createChannel = async (channelName: string, guildId: string) => {
    console.log("Creating channel with name:", channelName);
    let guild: any;

    const key = "DiscordData";
    const getData = await redis.get(key);
    console.log("getData from Redis :", JSON.stringify(getData));
    if (!getData) throw new Error("No Discord data found in Redis");
    const DiscordData: { botToken: string; clientId: string; clientSecret: string, guildId?: string }[] =
        JSON.parse(getData);
    const botInfo = DiscordData.find(d => d.guildId === guildId);
    console.log("botInfo :", botInfo);
    if (!botInfo) throw new Error("No bot found for the specified guildId");
    console.log("botClients :", botClients);
    guild = botClients.find(c => c.user?.id === botInfo.clientId);

    console.log("Bot client found for guildId:", guild);
    if (!guild) throw new Error("Bot client not found");
    console.log("Guild fetched:", guild.id);
    const guildObj = guild.guilds.cache.get(guildId);
    if (!guildObj) throw new Error("Guild not found on bot client");

    const result = await guildObj.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
    });

    console.log("Channel created:", result.name);
    const activeChatChannelskey = "ActiveChatChannels";
    const getActiveChatChannels = await redis.get(activeChatChannelskey);
    let activeChatChannels: { channelName: string; guildId: string; channelId: string; botId: string }[] = [];
    console.log("getActiveChatChannels :", getActiveChatChannels);
    if (getActiveChatChannels) {
        activeChatChannels = JSON.parse(getActiveChatChannels);
        activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    } else {
        activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }

    await redis.set(activeChatChannelskey, JSON.stringify(activeChatChannels));

    setTimeout(async () => {
        const getData = await redis.get(activeChatChannelskey);
        console.log("Updated ActiveChatChannels from Redis:", getData);
    }, 2000);

    return result;
}

const sendMessageToChannel = async (channelId: string, content: string, guildId: string) => {
    try {
        console.log("Sending message to channelId:", { channelId, content, guildId });

        let guild: any;

        const key = "ActiveChatChannels";
        const getActiveChatChannels = await redis.get(key);
        console.log("getData from Redis :", JSON.stringify(getActiveChatChannels));
        if (!getActiveChatChannels) throw new Error("No activeChatChannels data found in Redis");
        let activeChatChannels: { channelName: string; guildId: string; channelId: string; botId: string }[] = [] =
            JSON.parse(getActiveChatChannels);
        const botInfo = activeChatChannels.find(d => d.guildId === guildId);
        console.log("botInfo :", botInfo);
        if (!botInfo) throw new Error("No bot found for the specified guildId");
        console.log("botClients :", botClients);
        guild = botClients.find(c => c.user?.id === botInfo.botId);

        console.log("Bot client found for guildId:", guild);
        if (!guild) throw new Error("Bot client not found");
        console.log("Guild fetched:", guild.id);
        const guildObj = guild.guilds.cache.get(guildId);
        if (!guildObj) throw new Error("Guild not found on bot client");

        // Fetch the channel by ID
        const channel = await guildObj.channels.fetch(channelId);
        if (!channel) {
            console.log("Channel not found!");
            return;
        }

        // Send the message
        await channel.send(content);
        console.log(`Message sent to channel ${channel.name}`);
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

const botClients: Client[] = [];
const botMessageCallbacks: Map<string, ((bot: Client, message: Message) => void)[]> = new Map();

const loginBots = async () => {
    try {
        const getDiscordData = await redis.get("DiscordData");
        if (!getDiscordData) return [];

        const DiscordData: { botToken: string; cliedId: string; clientSecret: string }[] =
            JSON.parse(getDiscordData);

        const clients: Client[] = [];

        for (const item of DiscordData) {
            const botClient = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildMembers
                ]
            });

            botClient.once("ready", () => {
                console.log(`Bot logged in as ${botClient.user?.tag}`);
                console.log(`Bot ID   : ${botClient.user?.id}`);
                console.log(`Bot Tag  : ${botClient.user?.tag}`);
                const clientId = botClient.user?.id;

                console.log("Client ID :", clientId);

            });

            botClient.on("guildCreate", async (guild) => {
                const botUser = botClient.user;

                console.log("===== BOT JOINED A SERVER =====");
                console.log(`Joined a new server: ${guild.name}`);
                console.log(`Bot Username : ${botUser?.tag}`);
                console.log(`Bot ID       : ${botUser?.id}`);
                console.log(`Server Name  : ${guild.name}`);
                console.log(`Server ID    : ${guild.id}`);
                console.log(`Member Count : ${guild.memberCount}`);
                console.log(`Owner ID     : ${guild.ownerId}`);

                const putTheGuildIdTotheClient = async () => {
                    console.log("-----------------------------------------------");
                    console.log("call putTheGuildIdTotheClient");
                    const key = "DiscordData";
                    const getData = await redis.get(key);

                    let DiscordData: {
                        botToken: string;
                        clientId: string;
                        clientSecret: string;
                        guildId?: string;
                    }[] = [];

                    console.log("getData :", getData);

                    if (getData) {
                        DiscordData = JSON.parse(getData);
                    }

                    console.log("type of botUser?.id :", typeof botUser?.id);
                    DiscordData.map((d) => {
                        console.log("type of d.clientId :", typeof d.clientId);
                    })
                    const botInfo = DiscordData.find(d => d.clientId === botUser?.id);
                    console.log("botInfo :", botInfo);
                    if (!botInfo) return;

                    // Store single guildId
                    botInfo.guildId = guild.id;

                    await redis.set(key, JSON.stringify(DiscordData));
                    console.log(`Saved guild ${guild.id} for bot ${botUser?.tag}`);
                    setTimeout(async () => {
                        const getData = await redis.get(key);
                        console.log("Updated DiscordData from Redis:", getData);
                    }, 2000);
                };



                putTheGuildIdTotheClient()
            })

            // Optional: Listen to messages for this bot
            botClient.on("messageCreate", (message) => {
                // botClient.user gives the bot itself
                if (message.author.bot) {
                    console.log("Message from bot, ignoring.");
                    return
                };
                const botTag = botClient.user?.tag;   // e.g., "KHL#8511"
                const botId = botClient.user?.id;     // e.g., "1446061847798218786"
                console.log("User message:", message.content);

                // message.guild gives the server the message came from
                const guildId = message.guild?.id;    // e.g., "1457680812530208965"
                const guildName = message.guild?.name;

                const authorTag = message.author.tag; // who sent the message
                const content = message.content;      // message content

                const channelId = message.channel.id;

                console.log("Channel ID  :", channelId);

                const sendMessage = async (channelId: string, botId: string, guildId: string) => {
                    console.log("-----------------------------------------------");
                    console.log("call sendMessage");
                    const key = "ActiveChatChannels";
                    const getActiveChatChannels = await redis.get(key);
                    let activeChatChannels: { channelName: string; guildId: string; channelId: string; botId: string }[] = [];
                    console.log("getActiveChatChannels :", getActiveChatChannels);
                    if (getActiveChatChannels) {
                        activeChatChannels = JSON.parse(getActiveChatChannels);
                        const channelInfo = activeChatChannels.find(ac => ac.channelId === channelId && ac.botId === botId && ac.guildId === guildId);
                        if (!channelInfo) {
                            console.log("No matching active chat channel found. Ignoring message.");
                            return;
                        }
                        console.log("channelInfo :", channelInfo);
                        console.log("To reply  to the other platform")
                        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
                    } else {
                        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
                    }
                };

                sendMessage(channelId, botId!, guildId!);


                console.log(`[${botTag}] received a message in guild ${guildName} (${guildId}) from ${authorTag}: ${content}`);
            });

            await botClient.login(item.botToken);
            clients.push(botClient);
            botClients.push(botClient); // store globally if needed
        }

        return clients;
    } catch (error) {
        console.error("Error logging in bots:", error);
        return [];
    }
};

const logIn = async (botToken: string) => {
    const clients: Client[] = [];
    const botClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ]
    });

    botClient.once("ready", () => {
        console.log(`Bot logged in as ${botClient.user?.tag}`);
        console.log(`Bot ID   : ${botClient.user?.id}`);
        console.log(`Bot Tag  : ${botClient.user?.tag}`);
        const clientId = botClient.user?.id;

        console.log("Client ID :", clientId);

    });

    botClient.on("guildCreate", async (guild) => {
        const botUser = botClient.user;

        console.log("===== BOT JOINED A SERVER =====");
        console.log(`Joined a new server: ${guild.name}`);
        console.log(`Bot Username : ${botUser?.tag}`);
        console.log(`Bot ID       : ${botUser?.id}`);
        console.log(`Server Name  : ${guild.name}`);
        console.log(`Server ID    : ${guild.id}`);
        console.log(`Member Count : ${guild.memberCount}`);
        console.log(`Owner ID     : ${guild.ownerId}`);

        await putTheGuildIdTotheClient(botUser, guild.id)
    });

    botClient.on("messageCreate", (message) => {
        // botClient.user gives the bot itself
        if (message.author.bot) {
            console.log("Message from bot, ignoring.");
            return
        };
        const botTag = botClient.user?.tag;   // e.g., "KHL#8511"
        const botId = botClient.user?.id;     // e.g., "1446061847798218786"
        console.log("User message:", message.content);

        // message.guild gives the server the message came from
        const guildId = message.guild?.id;    // e.g., "1457680812530208965"
        const guildName = message.guild?.name;

        const authorTag = message.author.tag; // who sent the message
        const content = message.content;      // message content

        const channelId = message.channel.id;

        console.log("Channel ID  :", channelId);

        sendMessage(channelId, botId!, guildId!);


        console.log(`[${botTag}] received a message in guild ${guildName} (${guildId}) from ${authorTag}: ${content}`);
    });

    await botClient.login(botToken);
    clients.push(botClient);
    botClients.push(botClient);
    return clients;
};

const sendMessage = async (channelId: string, botId: string, guildId: string) => {
    console.log("-----------------------------------------------");
    console.log("call sendMessage");
    const key = "ActiveChatChannels";
    const getActiveChatChannels = await redis.get(key);
    let activeChatChannels: { channelName: string; guildId: string; channelId: string; botId: string }[] = [];
    console.log("getActiveChatChannels :", getActiveChatChannels);
    if (getActiveChatChannels) {
        activeChatChannels = JSON.parse(getActiveChatChannels);
        const channelInfo = activeChatChannels.find(ac => ac.channelId === channelId && ac.botId === botId && ac.guildId === guildId);
        if (!channelInfo) {
            console.log("No matching active chat channel found. Ignoring message.");
            return;
        }
        console.log("channelInfo :", channelInfo);
        console.log("To reply  to the other platform")
        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    } else {
        // activeChatChannels.push({ channelName, guildId, channelId: result.id, botId: botInfo.clientId });
    }
};

const putTheGuildIdTotheClient = async (botUser: any, guildId: string) => {
    console.log("-----------------------------------------------");
    console.log("call putTheGuildIdTotheClient");
    const key = "DiscordData";
    const getData = await redis.get(key);

    let DiscordData: {
        botToken: string;
        clientId: string;
        clientSecret: string;
        guildId?: string;
    }[] = [];

    console.log("getData :", getData);

    if (getData) {
        DiscordData = JSON.parse(getData);
    }

    console.log("type of botUser?.id :", typeof botUser?.id);
    DiscordData.map((d) => {
        console.log("type of d.clientId :", typeof d.clientId);
    })
    const botInfo = DiscordData.find(d => d.clientId === botUser?.id);
    console.log("botInfo :", botInfo);
    if (!botInfo) return;

    // Store single guildId
    botInfo.guildId = guildId;

    await redis.set(key, JSON.stringify(DiscordData));
    console.log(`Saved guild ${guildId} for bot ${botUser?.tag}`);
    setTimeout(async () => {
        const getData = await redis.get(key);
        console.log("Updated DiscordData from Redis:", getData);
    }, 2000);
};


const leaveGuild = async (client: {
    tag: string,
    id: string
}, guildId: string) => {
    const botClient = botClients.find(c => c.user?.id === client.id);
    try {

        if (!botClient) {
            console.log(`Bot with ID ${client.id} not found`);
            return false;
        }

        const guild = await botClient.guilds.fetch(guildId);
        if (!guild) {
            console.log(`Guild with ID ${guildId} not found for bot ${botClient.user?.tag}`);
            return false;
        }

        await guild.leave();
        console.log(`Bot ${botClient.user?.tag} left guild ${guild.name}`);
        return true;
    } catch (err) {
        console.error(`Error: Bot ${botClient?.user?.tag} failed to leave guild:`, err);
        return false;
    }
};
//  const createPrivateChannel = async (channelName: string, allowedMemberIds: string[] = []) => {

export {
    // client,
    createChannel,
    sendMessageToChannel,
    // createPrivateChannel,
    // addMemberToChannel,
    loginBots,
    leaveGuild
}


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