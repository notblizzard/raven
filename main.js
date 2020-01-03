// TODO:
// polls
// linter
// point system for trivia?
// kicks/bans with 2nd discord account
// roles

const Discord = require('discord.js');
const config = require('config');
const client = new Discord.Client();
const commands = require('./commands.js');
const reactions = require('./reactions.js')
const chalk = require('chalk');

const ravenConfig = config.get("Raven.token");

client.on('ready', () => {
    console.log(`Squawk! ${chalk.blue('Raven')} is ready!`);
});

client.on('message', message => {
    reactions(message, message.author);
    if (message.content.startsWith(config.get("Raven.commandkey")) && message.author.bot === false) {
        //const commandName = message.content.split(config.get("Raven.commandkey"))[1].split(" ")[0]; // todo: make this better
        try {
            let args = message.content.slice(4).split(' ');
            const commandName = args[0];
            args.shift();
            const user = message.author;
            //const message_ = message.content;
                            //client, member, channel, message, args
            commands[commandName].use(client, message.member, message.channel, message, args);
        } catch (e) {
        }

    }
})

client.login(ravenConfig);