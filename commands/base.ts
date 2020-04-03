import {
  Attachment,
  GuildMember,
  TextChannel,
  Message,
  RichEmbed,
  User,
  MessageReaction,
} from "discord.js";
import axios, { AxiosResponse } from "axios";
import commands from "./";

interface Votes {
  [key: string]: number;
}

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

interface Command {
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
}
export default {
  help: {
    args: "help",
    description: "",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      const commandsList: Commands = commands;
      if (args[0] === "all") {
        const commandsHelpList: string[] = [];
        for (const command in commands) {
          if (command !== "help") {
            commandsHelpList.push(
              `${process.env.RAVEN_COMMAND_KEY}**${commandsList[command].args}** - ${commandsList[command].description}`,
            );
          }
        }
        channel.send(commands);
      } else {
        const command: Command = commandsList[args[0]];
        channel.send(
          `${process.env.RAVEN_COMMAND_KEY}**${command.args}** - ${command.description}`,
        );
      }
    },
  },

  avatar: {
    args: "avatar <user>",
    description: "gets avatar of <user>",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      let url: string;
      let user: string;
      if (message.mentions.members.size > 0) {
        url = message.mentions.members.first().user.displayAvatarURL;
        user = message.mentions.members.first().user.username;
      } else {
        url = member.user.displayAvatarURL;
        user = member.user.username;
      }
      const fileType: string = url.slice(-4) === ".gif" ? ".gif" : ".png";
      channel.send(new Attachment(url, `${user}${fileType}`));
    },
  },

  define: {
    args: "define <word>",
    description: "defines <word> using **owlbot** API",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      //const word = message.content.split(' ')[1];
      const requestData: object = {
        method: "get",
        url: `https://owlbot.info/api/v3/dictionary/${args}`,
        headers: {
          Authorization: `Token ${process.env.RAVEN_OWLBOT}`,
        },
      };
      axios(requestData).then((res: AxiosResponse) => {
        const definition: string = res.data.definitions[0].definition;
        channel.send(`**${args}**: ${definition}`);
      });
    },
  },

  poll: {
    args: "poll <question>, <option1>, <option2>, <option3>, <option4>",
    description: "start a poll",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<void> {
      const votes: Votes = {
        "1️⃣": 0,
        "2️⃣": 0,
        "3️⃣": 0,
        "4️⃣": 0,
      };
      args = args.join(" ").split(",");
      const filter = (reaction: MessageReaction, user: User): boolean =>
        Object.keys(votes).includes(reaction.emoji.name) && !user.bot;

      const embed: RichEmbed = new RichEmbed()
        .setTitle(`${member.user.username}'s Poll`)
        .setAuthor(member.user.username, member.user.avatarURL)
        .addField("Question", args[0])
        .addField("1)", args[1], true)
        .addField("2)", args[2], true)
        .addBlankField()
        .addField("3)", args[3], true)
        .addField("4)", args[4], true);
      const messageSent: Promise<Message | Message[]> = channel.send(embed);
      messageSent.then(async (message) => {
        await (message as Message).react("1️⃣");
        await (message as Message).react("2️⃣");
        await (message as Message).react("3️⃣");
        await (message as Message).react("4️⃣");

        const collector = (message as Message).createReactionCollector(filter, {
          time: 15000,
        });
        collector.on("collect", (r: MessageReaction) => {
          votes[r.emoji.name] += 1;
          console.log(votes);
        });
        collector.on("remove", (r: MessageReaction) => {
          votes[r.emoji.name] -= 1;
        });

        collector.on("end", () => {
          const highestVote: unknown = Object.keys(votes).sort(
            (x, z) => votes[z] - votes[x],
          )[0];
          const votesName: string =
            votes[highestVote as number] === 1 ? "vote" : "votes";
          channel.send(
            `**${args[highestVote as number]}** (${highestVote}) wins with ${
              votes[highestVote as string]
            } ${votesName}.`,
          );
        });
      });
    },
  },

  dadjoke: {
    args: "dadjoke",
    description: "get a dad joke using **icanhazdadjoke** API",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      const requestData: object = {
        method: "get",
        url: "https://icanhazdadjoke.com",
        headers: {
          Accept: "application/json",
        },
      };
      axios(requestData).then((res: AxiosResponse) => {
        channel.send(res.data.joke);
      });
    },
  },
};
