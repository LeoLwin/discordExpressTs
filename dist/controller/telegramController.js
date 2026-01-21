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
const express_1 = __importDefault(require("express"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const broker_1 = __importDefault(require("../broker/broker"));
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, botId, clientSecret, type, user } = req.body;
        console.log("req.body :", req.body);
        const result = yield broker_1.default.call("aibot.messageBotIntegration.botIntegration", { token, botId, clientSecret, type, user });
        console.log("Result from broker:", result);
        res.json(result);
    }
    catch (error) {
        yield handleError(res, error);
    }
}));
exports.default = router;
