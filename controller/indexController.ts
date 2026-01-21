import express from "express";
import user from "./userController"
import discord from "./discordController.js";
import telegram from "./telegramController.js";
const router = express.Router();

router.get("/test", (req, res) => {
    res.send("Welcome to the DiscordAPI");
});
router.use("/", user);
router.use("/discord", discord);
router.use("/telegram", telegram)


export default router;