import "reflect-metadata";
import "./db.js";
import Discord from "discord.js";
import chalk from "chalk";
import commands from "./commands";

const client: Discord.Client = new Discord.Client();

client.on("ready", () => {
  console.log(`Squawk! ${chalk.blue("Raven")} is ready!`);
});

client.on("message", (message: Discord.Message) => {
  if (
    message.content.startsWith(process.env.RAVEN_COMMAND_KEY) &&
    message.author.bot === false
  ) {
    const args: string[] = message.content
      .slice(process.env.RAVEN_COMMAND_KEY.length)
      .split(" ");
    const commandName: string = args[0];
    if (Object.keys(commands).includes(commandName)) {
      args.shift();
      commands[commandName].use(message.member, message.channel, message, args);
    }
  }
});

client.login(process.env.RAVEN_TOKEN);
