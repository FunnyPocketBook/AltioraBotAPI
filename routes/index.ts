import * as Discord from "discord.js";
import * as fs from "fs";
import * as express from "express";
import bodyParser from "body-parser";
import * as Interfaces from "../interface.js";

const app = express.default();
const port = 10013;

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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  const body = req.body;
  if (body.accessToken !== config.accessToken) {
    console.log("Wrong token");
    res.send({ status: "wrong access token" });
    return;
  }
  next();
});

client.on("ready", () => {
  console.log("Beep boop bot be ready!");
});

app.post("/", (req, res) => {
  console.log("Req received");
  sendMessage(config.communityEventChannel, req, res);
});

app.post("/test", (req, res) => {
  console.log("Req test received");
  sendMessage(config.botTestChannel, req, res);
});

function sendMessage(channel: string, req: any, res: any) {
  const body = req.body;
  const guild: Discord.Guild | undefined = client.guilds.cache.get(
    config.altioraServer
  );
  const usernameId = guild?.members.cache.find(
    (u) => u.user.tag === body.username
  )?.id;
  const embed = new Discord.MessageEmbed()
    .setColor(1778203)
    .addField("New Time Added!", `<@!${usernameId}>`)
    .addField(`**New Time**`, `${body.newTime}`)
    .addField(`**Total Time**`, `${body.totalTime}`)
    .addField(`**Server Total**`, `${body.serverTotal}`);
  const chan: Discord.GuildChannel | undefined = guild?.channels.cache.get(
    channel
  );
  (chan as Discord.TextChannel).send(embed);
  res.send({ status: "success" });
}

function loadConfig(): Interfaces.Config {
  let config;
  try {
    const rawData = fs.readFileSync("appdata/config.json");
    config = JSON.parse(rawData.toString());
  } catch (e) {
    fs.writeFileSync("appdata/config.json", "{}");
    config = {};
  }
  return config;
}
