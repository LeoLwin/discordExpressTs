import express from "express";
import user from "./userController"
import discord from "./discordController.js";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Welcome to the DiscordAPI");
});
router.use("/", user);
router.use("/discord", discord);


export default router;