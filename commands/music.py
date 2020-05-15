from db import Session
from models.user import User
import requests
import os
from discord import Embed

last_fm_key = os.getenv("RAVEN_LASTFM_API")
youtube_key = os.getenv("RAVEN_YOUTUBE")
session = Session()

async def addlastfm(client, member, channel, message, args):
    if not args[0]:
        await channel.send("A last.fm name is required.")
        return

    last_fm_name = args[0]
    user = session.query(User).filter_by(discord_id=member.id).first()

    if not user:
        user = User(discord_id=member.id, points=0)
        session.add(user)
    else:
        user.last_fm = last_fm_name
    session.commit()

    await channel.send("updated")


async def lastfm(client, member, channel, message, args):
    user = session.query(User).filter_by(discord_id=member.id).first()
    if not user:
        user = User(discord_id=member.id,points=0)
        session.add(user)
        session.commit()
        await channel.send("You must first add your last.fm username.")
        return

    url = "https://ws.audioscrobbler.com/2.0"
    data = {
        "method": "user.getrecenttracks",
        "user": user.last_fm,
        "api_key": last_fm_key,
        "format": "json",
        "limit": "1"
    }
    headers = {
        "User-Agent": "WhatIsABlizzard/Raven"
    }

    response = requests.get(url,headers=headers,data=data).json()
    data = response["recenttracks"]["track"][0]

    embed = Embed(title=f"{member.name}'s LastFM")
    embed.set_author(name=member.name, icon_url=member.avatar_url)
    embed.add_field(name="Author", value=data["artist"]["#text"], inline=False)
    embed.add_field(name="Song", value=data["name"], inline=False)
    embed.add_field(name="Album", value=data["album"]["#text"], inline=False)
    embed.set_thumbnail(url=data["image"][2]["#text"])

    await channel.send(embed=embed)