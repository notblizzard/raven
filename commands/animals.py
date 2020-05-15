
import requests
from discord import Embed
import aiohttp
import io
import random

async def randomanimal(member, channel, message, args):
    animal = None
    if len(args) == 0:
        animal = random.choice(["dog", "fox", "bird", "cat", "goat"])
    else:
        animal = args[0]

    embed = Embed()
    url = None
    if animal == "dog":
        data = requests.get("https://random.dog/woof.json").json()
        url = data["url"]
    elif animal == "fox":
        data = requests.get("https://randomfox.ca/floof").json()
        url = data["image"]
    elif animal == "bird":
        data = requests.get("https://shibe.online/api/birds").json()
        url = data[0]
    elif animal == "cat":
        data = requests.get("https://aws.random.cat/meow").json()
        url = data["file"]
    elif animal == "goat":
        url = requests.get("https://placegoat.com/400").json()
    else:
        animal = random.choice(["dog", "fox", "bird", "cat", "goat"])
        return randomanimal(member, channel, [animal])

    embed.set_image(url=url)
    await channel.send(embed=embed)

async def catfact(member, channel, message, args):
    data = requests.get("https://cat-fact.herokuapp.com/facts").json()
    await channel.send(random.choice(data["all"]))