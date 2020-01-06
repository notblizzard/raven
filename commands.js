
const request = require('request');
const mongoose = require('mongoose');
const config = require('config');
const color = require('random-color');
const shuffle = require('shuffle-array');
const yt = require("ytdl-core");

const Attachment = require('discord.js').Attachment;
const RichEmbed = require('discord.js').RichEmbed;
mongoose.connect(config.get('Raven.mongodb'), {useNewUrlParser: true, useUnifiedTopology: true});

const blacklist = ['cub', 'children', 'young', 'gore', 'scat', 'shota', 'loli', 'necrophilia', 'underage'];

let db = mongoose.connection;

db.once('open', () => {});

let lastFmSchema = new mongoose.Schema({
    discordId: String,
    lastFmName: String
});

const questions = {};

const LastFM = mongoose.model('LastFM', lastFmSchema);

// user, member, channel, message, args

function e621Get(channel, member, tags, nsfw) {
    const url = `https://${nsfw ? "e621" : "e926"}.net/post/index.json?limit=10&tags=${tags.join('+')}`;
    const data = {
        'url': url,
        'headers': {
            'User-Agent': 'RavenBot/1.0 (NotBlizzard)'
        }
    }
    request.get(data, (err, res, body) => {
        const data = JSON.parse(body);
        data.sort(() => Math.random() - 0.5);
        for (const post of data) {

            let postTags = post.tags.split(' ');
            const postsThatContainBlacklistedTags = postTags.filter(x => blacklist.includes(x));
            if (postsThatContainBlacklistedTags.length > 0) {
                break;
            } else {
                const embed = new RichEmbed()
                    .setDescription(`By **${post.author}** | [Link](https://www.${nsfw ? "e621" : "e926"}.net/post/show/${post.id})`)
                    .addField('Tags Used', tags.join(', '))
                    .setAuthor(member.user.username, member.user.displayAvatarURL)
                    .setImage(post.file_url);
                console.log("OK!");
                return channel.send(embed);
            }
            break;
        }
    })

}
module.exports = {
    help: {
        args: "help",
        description: "",
        use(client, member, channel, message, args) {
            //channel.send('testing123');
            if (args[0] === 'all') {
                let commands = [];
                for (let command in module.exports) {
                    if (command !== "help") {
                        commands.push(`bird**${module.exports[command].args}** - ${module.exports[command].description}`);
                    }
                }
                channel.send(commands);
            } else {
                const command = module.exports[args[0]];
                channel.send([`bird**${command.args}**`,
                `${command.description}`]);
            }
        }
    },

    welcomemessage: {
        args: "welcomemessage",
        description: "sends RavenBot's welcome message to channel",
        use(client, member, channel, message, args) {
            channel.send(["Squack! Hello! I'm RavenBot. I'm a bot designed by Blizzard#1799.",
                "To see a list of available commands, type `birdhelp all`",
                "https://discord.gg/PKVus2h"])
        }
    },

    e621: {
        args: "e621 <tags>",
        description: "search for art on e621 with <tags>. can only be used in NSFW channels.",
        use(client, member, channel, message, args) {
            if (args.filter(x => blacklist.includes(x)).length > 0) return channel.send("Your search cannot include blacklisted tags.");
            if (!channel.nsfw) return channel.send("This channel is not flagged for NSFW. Please use `birde926` instead.")
            if (args.length === 0) return channel.send("You must have tags. Type `birdhelp e621` for more help.");
            return e621Get(channel, member, args, true);
        }
    },

    e926: {
        args: "e926 <tags>",
        description: "search for art on e926 with <tags>.",
        use(client, member, channel, message, args) {
            if (args.filter(x => blacklist.includes(x)).length > 0) return channel.send("Your search cannot include blacklisted tags.");
            if (args.length === 0) return channel.send("You must have tags. Type `birdhelp e926' for more help.");
            return e621Get(channel, member, args, false);
        }
    },

    uwu: {
        args: "uwu <text>",
        description: "translate <text> to OwO/UwU language",
        use(client, member, channel, message, args) {
            let textMessage = args.join(' ');
            textMessage = textMessage.replace(/(r|l|w)/g, 'w').replace(/n(?=a|e|i|o|u)/g, 'ny');
            channel.send(textMessage);
        }
    },

    yt: {
        args: "yt <args>",
        description: "searches on youtube for a video with the <args>",
        use(client, member, channel, message, args) {
            const requestData = {
                "url": "https://www.googleapis.com/youtube/v3/search",
                "qs": {
                    "part": "snippet",
                    "q": args.join("+"),
                    "key": config.get("Raven.youtube")
                },
                "headers": {
                    "Accept": "application/json"
                }
            };
            request.get(requestData, (err, res, body) => {
                console.log(body);
                const youtubeId = JSON.parse(body)["items"][0];//["id"];//["videoId"];
                member.voiceChannel.join().then(i => {
                    const stream = yt(`https://www.youtube.com/${youtubeId["id"]["videoId"]}`, {filter: "audioonly"});
                    const dispatcher = i.playStream(stream);
                    dispatcher.on('end', () => member.voiceChannel.leave());
                })
            })
        }
    },

    avatar: {
        args: "avatar <user>",
        description: "gets avatar of <user>",
        use(client, member, channel, message, args) {
            let url = '';
            let user = '';
            if (message.mentions.members.size > 0) {
                url = message.mentions.members.first().user.displayAvatarURL;
                user = message.mentions.members.first().user.username;
            } else {
                url = member.user.displayAvatarURL;
                user = member.user.username;
            }
            //url = url.split('?')[0];
            const fileType = url.slice(-4) === '.gif' ? '.gif' : '.png';
            channel.send(new Attachment(url, `${user}${fileType}`));
        }
    },


    kick: {
        args: "kick <user>",
        description: "kicks <user> from server",
        use(client, member, channel, message, args) {
            if (member.hasPermission('KICK_MEMBERS')) {
                const kickedUser = message.mentions.members.first();
                kickedUser.kick();
                channel.send(`${kickedUser} was kicked.`)
            }
        }
    },


    ban: {
        args: "ban <user>",
        description: "bans <user> from server",
        use(client, member, channel, message, args) {
            if (member.hasPermission('BAN_MEMBERS')) {
                const bannedUser = message.mentions.members.first();
                bannedUser.ban();
                channel.send(`${bannedUser} was banned.`);
            }
        }
    },

    clear: {
        args: "clear <number>",
        description: "clears <number> messages from the current channel",
        use(client, member, channel, message, args) {
            if (member.hasPermission("MANAGE_MESSAGES")) {
                channel.bulkDelete(args[0])
                    .then(channel.send(`${args} messages cleared!`))
                    .catch(console.error);
            }
        }
    },

    mute: {
        args: "mute <user>",
        description: "mutes <user>",
        use(client, member, channel, message, args) {
            if (member.hasPermission('KICK_MEMBERS')) {
                const role = member.guild.roles.find(i => i.name.toLowerCase() === 'silenced');
                const silencedUser = message.mentions.members.first();
                silencedUser.addRole(role);
                channel.send(`${silencedUser} was muted.`);
            }
        }
    },

    raven: {
        args: "raven",
        description: "Edgar Allen Poe",
        use(client, member, channel, message, args) {
            channel.send("Nevermore.");
        }
    },

    // todo: fix all of this
    poll: {
        args: "poll <question>, <option 1>, <option 2>, <option 3>, <option 4>",
        description: "starts a poll in the channel",
        use(client, member, channel, message, args) {
            args = args.join(' ').split(', ');
            const question = args[0];
            let choiceone = 0;
            let responses = {
                '1': 0,
                '2': 0,
                '3': 0,
                '4': 0
            };
            args = args.splice(1);
            const embed = new RichEmbed()
                .addField("Question", question)
                .addField("1)", args[0], true)
                .addField("2)", args[1], true)
                .addBlankField()
                .addField("3)", args[2], true)
                .addField("4)", args[3], true)
            channel.send(embed);
            channel.awaitMessages(m => m.content.slice(0, 8) === 'birdvote', {max: 10000, time: 15000, errors: ['time']})
                .then(m => {
                    //console.log(m.array()[0].content);
                    console.log("OK");
                    //channel.send(embed_);

                }).catch(m => {
                    let response = m.array()[0].content.slice(9);
                    console.log('respsonse is '+response);
                    if (5 > parseInt(response) > 0) {
                        responses[response] += 1;
                    }
                    const embed_ = new RichEmbed()
                        .setTitle("Results")
                        .addField(args[0], responses[1])
                        .addField(args[1], responses[2])
                        .addField(args[2], responses[3])
                        .addField(args[3], responses[4])
                        channel.send(embed_);
                    });
                }
    },

    define: {
        args: "define <word>",
        description: "defines <word> using **owlbot** API",
        use(client, member, channel, message, args) {
        //const word = message.content.split(' ')[1];
            const requestData = {
                url: `https://owlbot.info/api/v3/dictionary/${args}`,
                headers: {
                    'Authorization': `Token ${config.get('Raven.owlbot')}`
                }
            };
            request.get(requestData, (err, res, body) => {
                console.log(body);
                console.log(err);
                const data = JSON.parse(body)['definitions'][0];
                channel.send(`**${args}**: ${data['definition']}`);
            })
        }
    },

    dadjoke: {
        args: "dadjoke",
        description: "get a dad joke using **icanhazdadjoke** API",
        use(client, member, channel, message, args) {
            const requestData = {
                url: 'https://icanhazdadjoke.com',
                headers: {
                        "Accept": 'application/json'
                }
            };
            request.get(requestData, (err, res, body) => {
                const data = JSON.parse(body)['joke'];
                channel.send(data);
            })
        }
    },

    trivia: {
        args: "trivia",
        description: "posts a trivia question using **opentdb** API",
        use(client, member, channel, message, args) {
            request.get('https://opentdb.com/api.php?amount=1&type=multiple', (err, res, body) => {
                const data = JSON.parse(body)['results'][0];
                const question = data['question'].replace(/&quot;/g, '"');
                const user = member.user;
                user.trivia = true;
                //message.author.correctAnswer = data['correct_answer'].toLowerCase();
                let choices = Object.values(data['incorrect_answers']);
                choices.push(data['correct_answer']);
                shuffle(choices);
                choices.map(i => i.replace(/&#039;/g, "'").replace(/&quot;/g, '"'));

                const correctAnswerNumber = choices.indexOf(data['correct_answer']) + 1;
                const correctAnswer = data['correct_answer'];
                const embed = new RichEmbed()
                    .setTitle(`${user.username}'s Question`)
                    .setAuthor(user.username, user.avatarURL)
                    .addField('Question (You Have 20 Seconds To Answer)', question)
                    .addField('1)', choices[0], true)
                    .addField('2)', choices[1], true)
                    .addBlankField()
                    .addField('3)', choices[2], true)
                    .addField('4)', choices[3], true)
                    .setColor(color().hexString());

                channel.send(embed);
                channel.awaitMessages(m => m.author === user, {max: 1, time: 20000, errors: ['time']})
                    .then(m => {
                        user.answered = true;
                        if (m.array()[0].content != correctAnswerNumber) {
                            channel.send(`Incorrect, the answer is ${correctAnswer}.`);
                        } else {
                            channel.send('Correct!');
                        }
                    }).catch(m => {
                        if (!user.answered) channel.send(`Time's up! The answer was ${correctAnswer}.`);
                    });
                user.answered = false;
            });
        }
    },

    io: {
        args: "io <username> <realm> <region>",
        description: "gets raider.io score of <username>",
        use(client, member, channel, message, args) {
            const region = args[2];
            const realm = args[1];
            const user_ = args[0];
            const user = member.user;
            console.log("OK");
            const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${user_}&fields=gear,guild,mythic_plus_scores_by_season:current`;
            request.get(url, (err, res, body) => {
                const data = JSON.parse(body);
                const embed = new RichEmbed()
                    .setTitle(`${data['name']}'s RaiderIO`)
                    .setAuthor(user.username, user.avatarURL)
                    .addField('Name', `${data['name']}-${data['realm']}`)
                    .addField('iLvL', data['gear']['item_level_equipped'])
                    .addField('Guild', data['guild'] !== null ? data['guild']['name'] : 'None')
                    .addField('Class/Spec', `${data['active_spec_name']} ${data['class']}`)
                    .addField('Current IO Score', data['mythic_plus_scores_by_season'][0]['scores']['all'])
                    .setThumbnail(data['thumbnail_url'])
                    .setColor(color().hexString());

                channel.send(embed);
            });
        }
    },

    lastfm: {
        args: "lastfm <user>",
        description: "gets last.fm of <user>",
        use(client, member, channel, message, args) {
            const user = member.user;
            const discordId = user.id;
            LastFM.findOne({'discordId': discordId}, (err, lastfm) => {
                const lastFmApiKey = config.get('Raven.lastfmapi');
                const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfm.lastFmName}&api_key=${lastFmApiKey}&format=json&limit=1`;
                request.get(url, (err, res, body) => {
                    const data = JSON.parse(body)['recenttracks']['track'][0];
                    const embed = new RichEmbed()
                        .setTitle(`${user.username}'s LastFM`)
                        .setAuthor(user.username, user.avatarURL)
                        .addField('Author', data['artist']['#text'])
                        .addField('Song', data['name'])
                        .addField('Album', data['album']['#text'])
                        .setColor(color().hexString())
                        .setThumbnail(data['image'][2]['#text'])

                    channel.send(embed);
                });
            });
        }
    },

    addlastfm: {
        args: "addlastfm <user>",
        description: "adds your username to the data with <user> as the last.fm account name",
        use(client, member, channel, message, args) {
            const user = member.user;
            const discordId = user.id;
            const lastFmName = args;
            LastFM.findOne({'discordId': discordId}, (err, lastfm) => {
                if (lastfm === null) {
                    const last = new LastFM({'discordId': discordId, 'lastFmName': lastFmName});
                    last.save().then(() => channel.send(`Your LastFM account "${lastFmName}" has been added.`));
                } else {
                    LastFM.findOneAndUpdate({'discordId': lastfm.discordId}, {'discordId': lastfm.discordId, 'lastFmName': lastFmName}, (err, lastfm) => {
                        channel.send(`Your Discord name is now updated to the LastFM account "${lastFmName}".`);
                    });
                }
            });
        }
    },

    dog: {
        args: "dog",
        description: "shows a random picture of a dog",
        use(client, member, channel, message, args) {
            request.get('https://random.dog/woof.json', (err, res, body) => {
                const data = JSON.parse(body)['url'];
                channel.send(new Attachment(data));
            });
        }
    },

    fox: {
        args: "fox",
        description: "shows a random picture of a fox",
        use(client, member, channel, message, args) {
            request.get('https://randomfox.ca/floof', (err, res, body) => {
                const data = JSON.parse(body)['image'];
                channel.send(new Attachment(data));
            });
        }
    },

    bird: {
        args: "bird",
        description: "shows a random picture of a bird",
        use(client, member, channel, message, args) {
            request.get('https://shibe.online/api/birds', (err, res, body) => {
                const data = JSON.parse(body)[0];
                channel.send(new Attachment(data));
            });
        }
    },

    cat: {
        args: "cat",
        description: "shows a random picture of a cat",
        use(client, member, channel, message, args) {
            request.get('https://aws.random.cat/meow', (err, res, body) => {
                const data = JSON.parse(body)['file'];
                channel.send(new Attachment(data));
            });
        }
    },

    catfact: {
        args: "catfact",
        description: "get a random cat fact",
        use(client, member, channel, message, args) {
            request.get("https://cat-fact.herokuapp.com/facts", (err, res, body) => {
                const data = JSON.parse(body)['all'];
                channel.send(data[Math.floor(Math.random()*data.length)]["text"]);
            })
        }
    },

    goat: {
        args: "goat",
        description: "shows a random picture of a goat",
        use(client, member, channel, message, args) {
            const data = {
                url: 'https://placegoat.com/400',
                encoding: null
            };
            request.get(data, (err, res, body) => {
                channel.send(new Attachment(body));
            });
        }
    }
}