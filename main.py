import discord
import os
from dotenv import load_dotenv
load_dotenv()
import db
import commands

client = discord.Client()
key = os.getenv("RAVEN_KEY")
token = os.getenv("RAVEN_TOKEN")

@client.event
async def on_message(message):
    if message.content.startswith(key) and not message.author.bot:
        data = message.content[1:].split(" ")

        command_name = data[0]
        args = data[1:]

        if (hasattr(commands, command_name)):
            command = getattr(commands, command_name)
            await command(client, message.author, message.channel, message, args)


client.run(token)