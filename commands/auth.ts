import { GuildMember, TextChannel, Message } from "discord.js";

export default {
  kick: {
    args: "kick <user>",
    description: "kicks <user> from server",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      if (member.hasPermission("KICK_MEMBERS")) {
        const kickedUser: GuildMember = message.mentions.members.first();
        kickedUser.kick();
        channel.send(`${kickedUser} was kicked.`);
      }
    },
  },
  clear: {
    args: "clear <number>",
    description: "clears <number> messages from the current channel",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      if (member.hasPermission("MANAGE_MESSAGES")) {
        channel.bulkDelete(Number(args[0]) + 1).catch(console.error);
      }
    },
  },

  ban: {
    args: "ban <user>",
    description: "bans <user> from server",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      if (member.hasPermission("BAN_MEMBERS")) {
        const bannedUser: GuildMember = message.mentions.members.first();
        bannedUser.ban();
        channel.send(`${bannedUser} was banned.`);
      }
    },
  },
};
