import os
import requests
from discord import Embed
import asyncio
owlbot_key = os.getenv("OWLBOT_KEY")

async def avatar(client, member, channel, message, args):
    pass

async def define(client, member, channel, message, args):
    url = f"https://owlbot.info/api/v3/dictionary/{args[0]}"
    headers = {
        "Authorization": f"Token {owlbot_key}",
    }

    data = requests.get(url, headers=headers).json()
    definition = data["definitions"][0]["definition"]

    await channel.send(f"**{args[0]}**: {definition}")
