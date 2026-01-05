import dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, Message } from "discord.js";

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


// async function createChannel(channelName: string, guildId: string) {
//     console.log("Creating channel with name:", channelName);

//     const guild = await client.guilds.fetch(guildId);
//     // 1455870890830073984
//     // const guild = await client.guilds.fetch("1455880279389376584");
//     console.log("Guild fetched:", guild.name);

//     const result = await guild.channels.create({
//         name: channelName,
//         type: ChannelType.GuildText,
//     });

//     console.log("Channel created:", result.name);
//     return result;
// }

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


import { Channel, GuildChannel, TextChannel } from 'discord.js'; // Import GuildChannel
import redis from "../config/redis";

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

const botClients: Client[] = [];
const botMessageCallbacks: Map<string, ((bot: Client, message: Message) => void)[]> = new Map();

/**
 * Register a callback for a specific bot
 */
export const onBotMessage = (botId: string, callback: (bot: Client, message: Message) => void) => {
    if (!botMessageCallbacks.has(botId)) {
        botMessageCallbacks.set(botId, []);
    }
    botMessageCallbacks.get(botId)?.push(callback);
};


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
            });

            botClient.on("guildCreate", async (guild) => {
                console.log(`Joined a new server: ${guild.name}`);
                console.log("Guild Details:", guild.channels);
                // console.log("guild.channels.cache : ", guild.channels.cache)
                console.log(`Server ID: ${guild.id}`);
                console.log(`Member count: ${guild.memberCount}`);
                console.log(`Owner ID`, guild.ownerId);
            });

            // Optional: Listen to messages for this bot
            botClient.on("messageCreate", (message) => {
                // botClient.user gives the bot itself
                const botTag = botClient.user?.tag;   // e.g., "KHL#8511"
                const botId = botClient.user?.id;     // e.g., "1446061847798218786"

                // message.guild gives the server the message came from
                const guildId = message.guild?.id;    // e.g., "1457680812530208965"
                const guildName = message.guild?.name;

                const authorTag = message.author.tag; // who sent the message
                const content = message.content;      // message content

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



export {
    // client,
    // createChannel,
    // createPrivateChannel,
    // addMemberToChannel,
    loginBots,
    leaveGuild
}