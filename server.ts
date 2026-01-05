import * as dotenv from "dotenv"
dotenv.config();
import express from "express";
import ServiceBroker from "./broker/broker";
import indexController from "./controller/indexController";
import config from "./config/config";
import { loginBots } from "./helper/discord"


ServiceBroker.start().then(() => {
  console.log("Service Broker started.");
  const app = express();

  console.log("Express app initialized.");
  app.use(express.json());

  app.get("/", (req: any, res: any) => {
    res.send("Welcome to Discord API");
  });

  app.use("/api", indexController);

  const PORT = config.port || 8000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on http://0.0.0.0:${PORT}`);
  });

  // loginBots()
  // client.login(process.env.BOT_TOKEN);
});
