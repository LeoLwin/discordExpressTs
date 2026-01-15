"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("./userController"));
const discordController_js_1 = __importDefault(require("./discordController.js"));
const router = express_1.default.Router();
router.get("/test", (req, res) => {
    res.send("Welcome to the DiscordAPI");
});
router.use("/", userController_1.default);
router.use("/discord", discordController_js_1.default);
exports.default = router;
