


function reactToMessage(message, user) {
    const filter = (reaction, user) => {
        return reaction.emoji.name === "🦊"
    }

    const collector = message.createReactionCollector(filter);

    collector.on('collect', (reaction, reactionCollector) => {
        console.log(reaction.emoji.name);
    });
}


module.exports = reactToMessage;