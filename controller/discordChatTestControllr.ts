// const router = require("express").Router();
import express from "express";
import ServiceBroker from "../broker/broker"
import ResponseStatus from "../helper/responseStatus";
import type { Request, Response, NextFunction } from "express";
import { createChannel, deletChannel, getIdByEmail, leaveGuild, logInBot, loginBots, sendFileToChannel, sendMessageToChannel } from "../helper/discord";
import redis from "../config/redis";
import { Client } from "discord.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });


const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};


router.get("/", (req: Request, res: Response) => {
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


router.post("/addDiscordData", async (req: Request, res: Response) => {
  try {
    const { botToken, clientId, clientSecret } = req.body;
    if (!botToken || !clientId || !clientSecret) {
      return res.json(ResponseStatus.UNKNOWN("Missing parameters"));
    }

    const key = "DiscordData";
    const getData = await redis.get(key);

    let DiscordData: { botToken: string; clientId: string; clientSecret: string, guildId?: string }[] = [];

    if (getData) {
      DiscordData = JSON.parse(getData);

      // Avoid duplicate botToken
      if (DiscordData.some(d => d.botToken === botToken)) {
        return res.json(ResponseStatus.OK("Discord Agent already exists"));
      }
    }

    DiscordData.push({ botToken, clientId, clientSecret });
    await redis.set(key, JSON.stringify(DiscordData));

    const addBotToTheServerURL = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`

    console.log("Updated DiscordData in Redis:", DiscordData);
    const botClient = await logInBot(botToken, clientId, clientSecret);

    const client = {
      tag: botClient.user?.tag,
      id: botClient.user?.id.toString() // convert BigInt to string
    };

    res.json(ResponseStatus.OK({ addBotToTheServerURL, client }, "Discord Agent added successfully"));
  } catch (err) {
    console.error("Error in /addDiscordData:", err);
    res.json(ResponseStatus.UNKNOWN(err instanceof Error ? err.message : "Unknown error"));
  }
});

router.post("/create-channel", async (req, res) => {
  try {
    const { name, guildId } = req.body;
    console.log("req.body:", req.body);
    const channel = await createChannel(name, guildId);
    // console.log("channel create : ", channel)
    // console.log('hello')
    res.json({ success: true, channelId: channel.id });
  } catch (err: any) {
    handleError(res, err as Error);
  }
});

router.post("/delete-channel", async (req, res) => {
  try {
    const { channelId, guildId } = req.body;
    console.log("req.body:", req.body);
    const result = await deletChannel(channelId, guildId);
    res.json({ success: true, result });
  } catch (err: any) {
    handleError(res, err as Error);
  }
})

router.post(
  "/send-file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { channelId, guildId, content } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const message = await sendFileToChannel(
        channelId,
        guildId,
        req.file.buffer,
        req.file.originalname,
        content
      );

      return res.status(200).json({
        success: true,
        message: "File sent successfully",
        data: message
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

router.get("/deleteAllbots", async (req: Request, res: Response) => {
  try {
    await redis.del(`DiscordData`);
    await redis.del(`ActiveChatChannels`);
    res.json(ResponseStatus.OK("All bots deleted successfully"));
  } catch (err) {
    console.log("err in deleteAllbots :", err);
    handleError(res, err as Error);
  }
})

router.get("/loginBots", async (req: Request, res: Response) => {
  try {
    console.log("loginBots called");

    const getDiscordData = await redis.get("DiscordData");
    if (!getDiscordData) return [];

    const DiscordData: { botToken: string; cliedId: string; clientSecret: string }[] =
      JSON.parse(getDiscordData);
    const clients: Client[] = [];
    for (const item of DiscordData) {
      const botClient = await logInBot(item.botToken, item.cliedId, item.clientSecret); // array of Client instances
      clients.push(botClient);
    }

    // Map clients to a safe JSON response
    const result = clients.map(c => ({
      tag: c.user?.tag,
      id: c.user?.id.toString() // convert BigInt to string
    }));

    res.json(ResponseStatus.OK(result, "Bots logged in successfully"));
  } catch (err) {
    console.log("err in loginBots :", err);
    handleError(res, err as Error);
  }
});

router.get("/getAllbots", async (req: Request, res: Response) => {
  try {
    const getDiscordData = await redis.get(`DiscordData`);
    res.json(ResponseStatus.OK("All bots fetched successfully", JSON.parse(getDiscordData || '[]')));
  } catch (err) {
    console.log("err in getAllbots :", err);
    handleError(res, err as Error);
  }
})

router.post("/leaveGuild", async (req: Request, res: Response) => {
  try {
    const { client, guildId } = req.body;
    console.log("Leave Guild req.body:", req.body);
    if (!guildId) {
      return res.json(ResponseStatus.UNKNOWN("Missing guildId parameter"));
    }
    const result = await leaveGuild(client, guildId);
    console.log("deleteAllbots : ", result);
    if (result) {
      res.json(ResponseStatus.OK("Bot left the guild successfully"));
    } else {
      res.json(ResponseStatus.UNKNOWN("Failed to leave the guild"));
    }
  } catch (err) {
    console.log("err in leaveGuild :", err);
    handleError(res, err as Error);
  }
})

router.post("/sendMessageToChannel", async (req: Request, res: Response) => {
  try {
    const { channelId, guildId, content } = req.body;
    const result = await sendMessageToChannel(channelId, content, guildId,);
    res.json(ResponseStatus.OK(result, "Message sent successfully"));
  } catch (err) {
    console.log("err in sendMessageToChannel :", err);
    handleError(res, err as Error);
  }
})


router.get("/getActiveChatChannels", async (req: Request, res: Response) => {
  try {
    const getActiveChatChannels = await redis.get(`ActiveChatChannels`);

    res.json(ResponseStatus.OK("Active chat channels fetched successfully", JSON.parse(getActiveChatChannels || '[]')));
  } catch (err) {
    console.log("err in getActiveChatChannels :", err);
    handleError(res, err as Error);
  }
})

// router.post("/getIdByNames", async (req: Request, res: Response) => {
//   try {
//     const { clientid, guildId, agentNames } = req.body
//     const result = await getIdByEmail(guildId, agentNames)
//     res.json(ResponseStatus.OK("Fetched IDs successfully", result));
//   } catch (err) {
//     console.log("err in getActiveChatChannels :", err);
//     handleError(res, err as Error);
//   }
// })

// router.post()

export default router;

