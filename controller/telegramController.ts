import express from "express";
import ResponseStatus from "../helper/responseStatus";
import type { Request, Response, } from "express";
import theBroker from "../broker/broker";
const router = express.Router();

const handleError = (res: Response, err: Error) => {
    console.error("Endpoint error:", err);
    res.json(ResponseStatus.UNKNOWN(err.message));
};

router.post("/test", async (req: Request, res: Response) => {
    try {
        const { token, botId, clientSecret, type, user } = req.body;
        console.log("req.body :", req.body);

        const result = await theBroker.call("aibot.messageBotIntegration.botIntegration", { token, botId, clientSecret, type, user });
        console.log("Result from broker:", result);
        res.json(result)

    } catch (error) {
        await handleError(res, error as Error);
    }
})

export default router;