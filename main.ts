import "reflect-metadata";
import "./db";
import Discord, { GuildMember, TextChannel, Message } from "discord.js";
import chalk from "chalk";
import commands from "./commands";

const client: Discord.Client = new Discord.Client();

interface Commands {
  [key: string]: {
    args: string;
    description: string;
    use: (
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ) =>
      | string
      | void
      | Promise<void>
      | Promise<Message | Message[]>
      | Promise<Message>;
  };
}
const commandsList: Commands = commands;
client.on("ready", () => {
  console.log(`Squawk! ${chalk.blue("Raven")} is ready!`);
});

client.on("message", (message: Discord.Message) => {
  if (
    message.content.startsWith(process.env.RAVEN_COMMAND_KEY ?? "") &&
    message.author.bot === false
  ) {
    const args: string[] = message.content
      .slice(process.env.RAVEN_COMMAND_KEY?.length)
      .split(" ");
    const commandName: string = args[0];
    if (Object.keys(commands).includes(commandName)) {
      args.shift();
      console.log("sent");
      const command = commandsList[commandName];
      console.log(command);
      command.use(
        message.member,
        message.channel as TextChannel,
        message,
        args,
      );
    }
  }
});

client.login(process.env.RAVEN_TOKEN);
