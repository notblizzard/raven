
import re
import requests
import random
from discord import Embed, Permissions

blacklist = [
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
]

async def get_post(member, channel, tags, nsfw):
    site = "e621" if nsfw else "e926"
    rating = "+rating:s" if not nsfw else ""
    tags_array = tags
    tags = f'{"+".join(tags)}+-{"+-".join(blacklist)}'

    url = f'https://{site}.net/posts.json?limit=100&tags={tags}{rating}'
    headers = {"User-Agent": "RavenBot/1.0 (NotBlizzard)"}
    r = requests.get(url, headers=headers).json()

    posts = [post for post in r["posts"] for tag in post["tags"]["general"] if tag not in blacklist]

    random.shuffle(posts)

    post = posts[0]

    embed = Embed(
        description=f'By {",".join(post["tags"]["artist"])}',
    )

    embed.set_image(url=post["file"]["url"])
    embed.add_field(name="Tags used", value=", ".join(tags_array),inline=False)
    embed.add_field(name="votes",value=f':arrow_up: {post["score"]["up"]} | :arrow_down: {post["score"]["down"]}',inline=False)
    embed.set_author(name=member.name,icon_url=member.avatar_url)
    await channel.send(embed=embed)

async def e621(member, channel, message, args):
    await get_post(member, channel, args, True)

async def e926(member, channel, message, args):
    await get_post(member, channel, args, False)

async def owo(member, channel, message, args):
    message = " ".join(args)
    text = re.sub(r'(r|l|w)', "w", message)
    text = re.sub(r'n(?=a|e|i|o|u)', "ny", text)

    await channel.send(text)