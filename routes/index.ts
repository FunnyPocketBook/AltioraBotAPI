import * as Discord from "discord.js";
import * as fs from "fs";
import * as express from "express";
import bodyParser from "body-parser";
import * as Interfaces from "../interface.js";
import { time } from "node:console";

const app = express.default();
const port = 10013;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

const clientOptions = {
  intents: new Discord.Intents([
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS",
    "GUILD_INTEGRATIONS",
    "GUILD_WEBHOOKS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGE_TYPING",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING"
  ])
};

const client = new Discord.Client(clientOptions);
let config = loadConfig();
client.login(config.botToken);

client.on("ready", () => {
  console.log("Beep boop bot be ready!");
});

app.post("/", (req, res) => {
  console.log("Req received");
  const body = req.body;
  let message = `${body.username} has added **${body.minutes}** more minutes to their total time, which now adds up to **${body.total}**!\nServer total: **${body.serverTotal}**`;
  const guild: Discord.Guild | undefined = client.guilds.cache.get(
    config.altioraServer
  );
  const chan: Discord.GuildChannel | undefined = guild?.channels.cache.get(
    config.botTestChannel
  );
  (chan as Discord.TextChannel).send(message);
  res.send({ status: "success" });
});

function loadConfig(): Interfaces.Config {
  let config;
  try {
    const rawData = fs.readFileSync("config.json");
    config = JSON.parse(rawData.toString());
  } catch (e) {
    fs.writeFileSync("config.json", "{}");
    config = {};
  }
  return config;
}
