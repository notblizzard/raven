import { Attachment, GuildMember, TextChannel, Message } from "discord.js";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import shuffle from "lodash/shuffle";

export default {
  randomanimal: {
    args: "randomanimal <animal>",
    description:
      "shows a random picture of <animal>. [cat, dog, fox, bird, goat]",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<void> {
      const animal: string = args?.[0];
      switch (animal) {
        case "dog":
          axios
            .get("https://random.dog/woof.json")
            .then((res: AxiosResponse) => {
              channel.send(new Attachment(res.data.url));
            });
          break;
        case "fox":
          axios.get("https://randomfox.ca/floof").then((res: AxiosResponse) => {
            channel.send(new Attachment(res.data.image));
          });
          break;
        case "bird":
          axios
            .get("https://shibe.online/api/birds")
            .then((res: AxiosResponse) => {
              channel.send(new Attachment(res.data[0]));
            });
          break;
        case "cat":
          axios
            .get("https://aws.random.cat/meow")
            .then((res: AxiosResponse) => {
              channel.send(new Attachment(res.data.file));
            });
          break;
        case "goat":
          const data: AxiosRequestConfig = {
            url: "https://placegoat.com/400",
            responseType: "stream",
            method: "get",
          };
          axios(data).then((res: AxiosResponse) => {
            channel.send(new Attachment(res.data));
          });
          break;
        default:
          this.use(member, channel, message, [
            shuffle(["cat", "dog", "fox", "bird", "goat"])[0],
          ]);
      }
    },
  },

  catfact: {
    args: "catfact",
    description: "get a random cat fact",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      axios
        .get("https://cat-fact.herokuapp.com/facts")
        .then((res: AxiosResponse) => {
          const data: string = res.data.all;
          channel.send(data[Math.floor(Math.random() * data.length)]["text"]);
        });
    },
  },
};
