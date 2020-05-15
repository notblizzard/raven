
from commands.permissions import permissions


@permissions("kick")
async def kick(member, channel, message, args):
    user = message.mentions[0]
    await user.kick()

@permissions("ban")
async def ban(member, channel, message, args):
    user = message.mentions[0]
    await user.ban()

@permissions(None)
async def clear(member, channel, message, args):
    if not args[0]:
        await channel.send("You must specify an amount of messages to delete.")
    else:
        await channel.purge(limit=int(args[0]))

