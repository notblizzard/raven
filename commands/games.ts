import axios, { AxiosResponse } from "axios";
import User from "../models/User";
import randomcolor from "randomcolor";
import shuffle from "shuffle-array";

import { RichEmbed, GuildMember, TextChannel, Message } from "discord.js";
import { User as User_ } from "discord.js";

interface TriviaUser extends User_ {
  trivia?: boolean;
  answered?: boolean;
}

export default {
  dice: {
    args: "dice <numberOfDice>d<sides>",
    description: "roll <numberOfDice> of dice that have <sides> sides",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<Message | Message[]> {
      const numberOfDice = Number(args[0].split("d")[0]);
      const sides = Number(args[0].split("d")[1]);
      const results: number[] = [];
      for (let i = 0; i < numberOfDice; i++) {
        const result: number =
          Math.floor(Math.random() * Math.floor(sides)) + 1;
        results.push(result);
      }
      return channel.send(
        `:game_die: Roll ${numberOfDice} ${sides}-sided dice. :game_die: \n:game_die: Results: ${results.join(
          ", ",
        )}. Total: ${results.reduce((x, y) => x + y)}.:game_die:`,
      );
    },
  },

  points: {
    args: "points | points <user>",
    description: "get points of yourself, or <user>",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<Message | Message[]> {
      if (message.mentions.members.size > 0) {
        const discordUser: GuildMember = message.mentions.members.first();
        const user: User = await User.findOrCreate(discordUser.id);
        return channel.send(
          `${discordUser.user.username} has ${user.points} points`,
        );
      } else {
        const user: User = await User.findOrCreate(member.user.id);
        return channel.send(
          `${member.user.username} has ${user.points} points`,
        );
      }
    },
  },
  trivia: {
    args: "trivia",
    description: "posts a trivia question using **opentdb** API",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<void> {
      const user = await User.findOrCreate(member.user.id);

      axios
        .get(
          "https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986",
        )
        .then((res: AxiosResponse) => {
          const data = res.data.results[0];
          const question: string = data.question.replace(/&quot;/g, '"');
          const triviaUser: TriviaUser = member.user;
          triviaUser.trivia = true;
          const choices: string[] = Object.values(data.incorrect_answers);
          choices.push(data.correct_answer);
          shuffle(choices);
          choices.map((i) => i.replace(/&#039;/g, "'").replace(/&quot;/g, '"'));
          const difficulty: string = data.difficulty;
          const correctAnswerNumber: number =
            choices.indexOf(data.correct_answer) + 1;
          const correctAnswer: string = data.correct_answer;
          const embed: RichEmbed = new RichEmbed()
            .setTitle(`${triviaUser.username}'s Question`)
            .setAuthor(triviaUser.username, triviaUser.avatarURL)
            .addField("Difficulty", difficulty)
            .addField("Question (You Have 20 Seconds To Answer)", question)
            .addField("1)", choices[0], true)
            .addField("2)", choices[1], true)
            .addBlankField()
            .addField("3)", choices[2], true)
            .addField("4)", choices[3], true)
            .setColor(randomcolor());

          channel.send(embed);
          channel
            .awaitMessages((m) => m.author === member.user, {
              max: 1,
              time: 20000,
              errors: ["time"],
            })
            .then(async (m) => {
              triviaUser.answered = true;
              if (Number(m.array()[0].content) != correctAnswerNumber) {
                channel.send(`Incorrect, the answer is ${correctAnswer}.`);
              } else {
                channel.send("Correct!");
                user.points +=
                  difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15;
                await user.save();
              }
            })
            .catch(() => {
              if (!triviaUser.answered)
                channel.send(`Time's up! The answer was ${correctAnswer}.`);
            });
          triviaUser.answered = false;
        });
    },
  },
};
