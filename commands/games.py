
import random
from db import Session
from models.user import User
session = Session()
from discord import Embed
import requests
import asyncio

async def dice(client, member, channel, message, args):
    number_of_dice = int(args[0].split("d")[0])
    number_of_sides = int(args[0].split("d")[1])

    results = [random.randint(1, number_of_sides) for i in range(1, number_of_dice+1)]
    await channel.send(results)

async def points(client, member, channel, message, args):
    user = session.query(User).filter_by(discord_id=member.id).first()
    points = None
    if not user:
        user = User(discord_id=member.id, points=0)
        session.add(user)
        session.commit()
        points = 0
    else:
        points = user.points

    await channel.send(f"You have {points} {'Point' if points == 1 else 'Points'}.")


async def trivia(client, member, channel, message, args):
    url = "https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986"
    data = requests.get(url).json()["results"][0]

    question = data["question"]
    #member["trivia"] = True
    choices = data["incorrect_answers"]
    print(choices)
    choices.append(data["correct_answer"])
    difficulty = data["difficulty"]
    correct_answer = choices.index(data["correct_answer"]) + 1

    embed = Embed(title=f"{member.name}'s Question")

    embed.set_author(name=member.name,icon_url=member.avatar_url)
    embed.add_field(name="Difficulty",value=difficulty, inline=False)
    embed.add_field(name="Question (You Have 20 Seconds To Answer)", value=question, inline=False)
    embed.add_field(name="1)", value=choices[0], inline=True)
    embed.add_field(name="2)", value=choices[1], inline=True)
    embed.add_field(name="3)", value=choices[2], inline=False)
    embed.add_field(name="4)", value=choices[3], inline=True)

    await channel.send(embed=embed)

    def check(m):
        return m.author == member

    try:
        response = await client.wait_for("message", check=check, timeout=5.0)
        print(response)
    except asyncio.TimeoutError:
        await channel.send("no response.")

