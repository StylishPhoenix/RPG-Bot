# Discord RPG Bot
Discord RPG Bot is a simple role-playing game bot for Discord servers. Players can create characters, fight enemies, and gain experience to improve their characters' abilities. The bot uses Discord's slash commands for easy interaction and stores player data in an SQLite database.

Features
Character creation with different classes and stats
Turn-based combat system
Random enemy encounters
Player progress saved in SQLite database
# Installation
Clone this repository or download the source code:
```
git clone https://github.com/yourusername/discord-rpg-bot.git
```

Install the required dependencies:

```
cd discord-rpg-bot
npm install
```

Create a .env file in the project root directory and add your Discord bot token:
```
TOKEN=your_bot_token_here
```
Start the bot:

```
node index.js
```

Usage
Players can interact with the RPG bot using Discord's slash commands. Here are some example commands:

`/create-character` Create a new character with a name and class
`/attack` Attack a random enemy and engage in turn-based combat
`/stats` View your character's stats, such as health, attack, and defense
Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

License
MIT
