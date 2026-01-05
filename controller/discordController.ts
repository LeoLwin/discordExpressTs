// const router = require("express").Router();
import express from "express";
import ServiceBroker from "../broker/broker"
import ResponseStatus from "../helper/responseStatus";
import type { Request, Response, NextFunction } from "express";
import { leaveGuild, loginBots } from "../helper/discord";
import redis from "../config/redis";

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
    const { botToken, cliedId, clientSecret } = req.body;
    if (!botToken || !cliedId || !clientSecret) {
      return res.json(ResponseStatus.UNKNOWN("Missing parameters"));
    }

    const key = "DiscordData";
    const getData = await redis.get(key);

    let DiscordData: { botToken: string; cliedId: string; clientSecret: string }[] = [];

    if (getData) {
      DiscordData = JSON.parse(getData);

      // Avoid duplicate botToken
      if (DiscordData.some(d => d.botToken === botToken)) {
        return res.json(ResponseStatus.OK("Discord Agent already exists"));
      }
    }

    DiscordData.push({ botToken, cliedId, clientSecret });
    await redis.set(key, JSON.stringify(DiscordData));

    const addBotToTheServerURL = `https://discord.com/oauth2/authorize?client_id=${cliedId}&permissions=8&integration_type=0&scope=bot+applications.commands`

    console.log("Updated DiscordData in Redis:", DiscordData);

    res.json(ResponseStatus.OK(addBotToTheServerURL, "Discord Agent added successfully"));
  } catch (err) {
    console.error("Error in /addDiscordData:", err);
    res.json(ResponseStatus.UNKNOWN(err instanceof Error ? err.message : "Unknown error"));
  }
});



// router.post("/create-channel", async (req, res) => {
//   try {
//     const { name, guildId } = req.body;
//     console.log("req.body:", req.body);
//     const channel = await createChannel(name, guildId);
//     // console.log("channel create : ", channel)
//     // console.log('hello')
//     res.json({ success: true, channelId: channel.id });
//   } catch (err: any) {
//     handleError(res, err as Error);
//   }
// });

router.get("/deleteAllbots", async (req: Request, res: Response) => {
  try {
    await redis.del(`DiscordData`);
    res.json(ResponseStatus.OK("All bots deleted successfully"));
  } catch (err) {
    console.log("err in deleteAllbots :", err);
    handleError(res, err as Error);
  }
})

router.get("/loginBots", async (req: Request, res: Response) => {
  try {
    console.log("loginBots called");
    const clients = await loginBots(); // array of Client instances

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


export default router;

