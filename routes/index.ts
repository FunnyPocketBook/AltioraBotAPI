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
let guild: Discord.Guild | undefined;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  const body = req.body;
  if (body.accessToken !== config.accessToken) {
    console.log(
      `Wrong token, ${body.accessToken} provided, needed ${config.accessToken}`
    );
    console.log(body);
    res.send({ status: "wrong access token" });
    return;
  }
  next();
});

client.on("ready", () => {
  console.log("Beep boop bot be ready!");
  guild = client.guilds.cache.get(config.altioraServer);
});

app.post("/walking-challenge", (req, res) => {
  console.log("Req /walking-challenge received");
  console.log(req.body);
  sendMessage(config.communityEventChannel, req, res);
});

app.post("/walking-challenge/test", (req, res) => {
  console.log("Req /walking-challenge/test received");
  console.log(req.body);
  sendMessage(config.botTestChannel, req, res);
});

app.post("/test", async (req, res) => {
  console.log("Req /test received");
  console.log(req.body);
  try {
    const chan: Discord.GuildChannel | undefined = guild?.channels.cache.get(
      config.botTestChannel
    );
    await (chan as Discord.TextChannel).send(req.body.message);
    res.send({ status: "success" });
  } catch (e) {
    console.error(e);
    res.send({ status: "error" });
  }
});

app.post("/sendMessage", async (req, res) => {
  console.log("Req /sendMessage received");
  console.log(req.body);
  try {
    const chan: Discord.GuildChannel | undefined = guild?.channels.cache.get(
      req.body.channelId
    );
    await (chan as Discord.TextChannel).send(req.body.message);
    res.send({ status: "success" });
  } catch (e) {
    console.error(`Couldn't send message ${req.body.message}:\n${e}`);
    res.send({ status: "error" });
  }
});

function sendMessage(channel: string, req: any, res: any) {
  const body = req.body;
  const usernameId = guild?.members.cache.find(
    (u) => u.user.tag === body.username
  )?.id;
  const user = usernameId ? `<@!${usernameId}>` : body.username;
  const embed = new Discord.MessageEmbed()
    .setColor(1778203)
    .addField("New Time Added!", user)
    .addField(`**New Time**`, `${body.newTime}`)
    .addField(`**Total Time**`, `${body.totalTime}`)
    .addField(`**Server Total**`, `${body.serverTotal}`);

  try {
    const chan: Discord.GuildChannel | undefined = guild?.channels.cache.get(
      channel
    );
    (chan as Discord.TextChannel).send(embed);
    res.send({ status: "success" });
  } catch (e) {
    res.send({ status: "error" });
  }
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
