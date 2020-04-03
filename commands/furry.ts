import randomcolor from "randomcolor";
import shuffle from "lodash/shuffle";

import { RichEmbed, GuildMember, TextChannel, Message } from "discord.js";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

const blacklist: string[] = [
  "cub",
  "children",
  "young",
  "gore",
  "scat",
  "shota",
  "loli",
  "rape",
  "necrophilia",
  "underage",
];

interface Post {
  tags: {
    general: string[];
  };
}

function eGet(
  channel: TextChannel,
  member: GuildMember,
  tags: string[],
  nsfw: boolean,
): void {
  const siteName: string = nsfw ? "e621" : "e926";
  const tags_ = `${tags.join("+")}+-${blacklist.join("+-")}`;
  const url = `https://${siteName}.net/posts.json?limit=100&tags=${tags_}${
    !nsfw ? "+rating:s" : ""
  }`;
  const data: AxiosRequestConfig = {
    method: "get",
    url: url,
    headers: {
      "User-Agent": "RavenBot/1.0 (NotBlizzard)",
    },
  };
  axios(data).then((res: AxiosResponse) => {
    const post = shuffle(
      res.data.posts.filter((post: Post) => {
        return post.tags.general.every((tag: string) => {
          return !blacklist.includes(tag);
        });
      }),
    )[0];

    const embed: RichEmbed = new RichEmbed()
      .setDescription(
        `By **${post.tags?.artist.join(
          ", ",
        )}** | [Link](https://www.${siteName}.net/posts/${post.id})`,
      )
      .addField("Tags Used", tags.join(", "))
      .addField(
        "Votes",
        `:arrow_up: ${post.score.up} | :arrow_down: ${post.score.down}`,
      )
      .setAuthor(member.user.username, member.user.displayAvatarURL)
      .setImage(post.file.url)
      .setColor(randomcolor());
    channel.send(embed);
  });
}

export default {
  e621: {
    args: "e621 <tags>",
    description:
      "search for art on e621 with <tags>. can only be used in NSFW channels.",

    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<Message | Message[]> | void {
      if (args.filter((tag: string) => blacklist.includes(tag)).length > 0)
        return channel.send("Your search cannot include blacklisted tags.");
      if (!channel.nsfw) {
        channel.send(
          "This channel is not flagged for NSFW. Using e926 instead.",
        );
        return eGet(channel, member, args, false);
      }
      if (args.length === 0) {
        return channel.send(
          `You must have tags. Type "${process.env.RAVEN_COMMAND_KEY}help e621" for more help.`,
        );
      }
      eGet(channel, member, args, true);
    },
  },

  e926: {
    args: "e926 <tags>",
    description: "search for art on e926 with <tags>.",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<Message | Message[]> | void {
      if (args.filter((x) => blacklist.includes(x)).length > 0)
        return channel.send("Your search cannot include blacklisted tags.");
      if (args.length === 0)
        return channel.send(
          `You must have tags. Type "${process.env.RAVEN_COMMAND_KEY}help e926" for more info.`,
        );
      return eGet(channel, member, args, false);
    },
  },

  owo: {
    args: "owo <text>",
    description: "translate <text> to owo language",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<Message | Message[]> {
      const textMessage: string = args
        .join(" ")
        .replace(/(r|l|w)/g, "w")
        .replace(/n(?=a|e|i|o|u)/g, "ny");
      return channel.send(textMessage);
    },
  },
};
