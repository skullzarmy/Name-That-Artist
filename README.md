# 🎨 Name That Artist - TTC Edition

A Discord trivia bot that challenges players to identify artists behind NFTs from **The Tezos Community (TTC)** wallet. The game fetches real NFT data from objkt.com and runs timed, multi-round competitions with scoring based on speed and accuracy.

## 📋 Features

- 🎮 **Multi-round gameplay** - 10 rounds per game with timed responses
- 🖼️ **Real NFT data** - Fetches from TTC wallet via objkt.com GraphQL API
- 🔘 **Button-based UI** - Multiple choice answers (A/B/C/D)
- ⏱️ **Speed-based scoring** - Faster answers earn more points
- 🏆 **Persistent leaderboard** - Track top players across games
- 📊 **Comprehensive statistics** - Track wins, accuracy, correct/incorrect answers
- 🎯 **All-time leaderboards** - Multiple sorting options for different achievements
- 💾 **Token caching** - Automatic refresh every 24 hours
- 💿 **Progressive storage** - Append-only logs for durability and crash recovery
- 🎨 **TTC branding** - Tezos community themed throughout
- ⚡ **Built for Node.js** - Discord.js v14 with ES6 modules
- 🛡️ **Anti-spam protection** - Command cooldowns prevent abuse
- 👮 **Admin controls** - Moderators can bypass cooldowns and manage games

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher (22.x/24.x LTS recommended — 18.x has reached end-of-life) or Bun
- A Discord Bot Token ([Create one here](https://discord.com/developers/applications))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/skullzarmy/Name-That-Artist.git
cd Name-That-Artist
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Discord bot credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
```

### Getting Discord Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section:
   - Click "Add Bot"
   - Copy the **Token** (this is your `DISCORD_TOKEN`)
   - Enable "Message Content Intent" under Privileged Gateway Intents
4. Go to "OAuth2" → "General":
   - Copy the **Application ID** (this is your `CLIENT_ID`)
5. Invite the bot to your server:
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Embed Links`, `Read Messages/View Channels`
   - Copy and open the generated URL

### Deploy Commands

Register slash commands with Discord:
```bash
npm run deploy-commands
```

### Start the Bot

```bash
npm start
```

Or for development (auto-restart on changes):
```bash
npm run dev
```

For running the bot long-term on a Linux host (e.g. in a `screen` session), see the "Running in Production" section in [SETUP.md](./SETUP.md).

## 🎮 Commands

- `/namethatartist` - Start a new game (10 rounds of trivia)
- `/leaderboard` - View top players by total score
- `/alltime [sort]` - View all-time leaderboards with various sorting options:
  - Total Score (default)
  - Total Wins
  - Average Score
  - Best Score
  - Accuracy Rate
  - Games Played
  - Correct Answers
- `/stats` - View your personal game statistics
- `/stopgame` - Stop the current game (starter or moderator only)
- `/ping` - Check if the bot is responsive
- `/help` - Get help and information about the game
- `/precache` - Pre-load all game images into Discord's cache (Admin only)
- `/ignorelist add|remove|list` - Manage NFT contracts excluded from game selection, with fuzzy name search (Admin only)

## 🛡️ Anti-Spam & Moderation

The bot includes built-in protection against spam and abuse:

### Command Cooldowns

Commands have cooldowns to prevent spam:
- **Game Start** (`/namethatartist`): 30 seconds per user, 5 seconds per channel
- **Leaderboard** (`/leaderboard`): 10 seconds per user
- **All-Time Stats** (`/alltime`): 10 seconds per user
- **Stats** (`/stats`): 5 seconds per user
- **Stop Game** (`/stopgame`): 3 seconds per user
- **Help** (`/help`): 10 seconds per user
- **Ping** (`/ping`): 5 seconds per user

### Admin Features

Users with **Administrator** or **Manage Messages** permissions can:
- Bypass all command cooldowns
- Stop any active game in their channels
- Help moderate game sessions

Users with **Administrator** permission can additionally:
- Pre-cache all game images with `/precache`
- Curate which NFT contracts are eligible for gameplay with `/ignorelist` — useful for excluding non-art collectible drops (sports cards, etc.) that don't fit the "name the artist" premise

Cooldown settings can be customized in `config.js` under the `cooldowns` section.

## 🏗️ Project Structure

```
Name-That-Artist/
├── index.js              # Main bot entry point with Discord handlers
├── game.js               # Multi-round game logic and session management
├── config.js             # Configuration and game settings
├── deploy-commands.js    # Slash command registration
├── services/
│   ├── objkt-api.js      # objkt.com GraphQL API integration
│   ├── storage.js        # Local JSON storage for data persistence
│   └── cooldown.js       # Command cooldown and anti-spam management
├── data/                 # Auto-generated data files (gitignored)
│   ├── tokens.json       # Cached NFT tokens
│   ├── players.json      # Player statistics
│   ├── game_state.json   # Active game sessions
│   └── ignored_contracts.json  # Admin-managed contract ignore list
├── package.json          # Project dependencies
├── .env.example          # Example environment variables
└── README.md            # This file
```

## 🛠️ Technology Stack

- **Discord.js v14** - Discord API wrapper with button interactions
- **graphql-request** - objkt.com GraphQL API client
- **Node.js** - JavaScript runtime (ES6 modules)
- **dotenv** - Environment variable management
- **Local JSON storage** - Persistent data without database
- Compatible with **Bun** runtime

## 🎨 About TTC

This bot is created for **The Tezos Community (TTC)**, celebrating the vibrant art scene on the Tezos blockchain. The game fetches NFTs from the TTC community wallet (`tz1RZN17j7FuPtDpGpXKgMXbx57WEhpZGF6B`) and helps members discover and appreciate the talented artists in the ecosystem.

## 🎯 How It Works

1. **Initialization**: Bot fetches NFT tokens from the TTC wallet via objkt.com GraphQL API
2. **Token Caching**: Stores tokens locally for 24 hours to reduce API calls
3. **Game Start**: Player initiates a game with `/namethatartist`
4. **Rounds**: Each game has 10 rounds with random NFTs
5. **Multiple Choice**: Each round shows 4 artist options (1 correct, 3 distractors)
6. **Timed Answers**: Players have 15 seconds to click the correct button
7. **Scoring**: Points = 100 × (time_remaining / total_time)
8. **Leaderboard**: Scores are saved and tracked across games

## 📊 All-Time Statistics

The bot tracks comprehensive player statistics across all games:

### Tracked Metrics

- **Total Games Played** - How many games you've participated in
- **Total Wins** - Number of games won (highest score)
- **Total Score** - Cumulative points across all games
- **Average Score** - Mean score per game
- **Best Score** - Your personal high score
- **Correct Answers** - Total number of correct answers across all games
- **Incorrect Answers** - Total number of wrong answers
- **Accuracy Rate** - Percentage of correct answers

### Leaderboard Views

Use `/alltime` with different sorting options to see who leads in:
- 📈 **Total Score** - Most points accumulated (default)
- 🏆 **Total Wins** - Most games won
- 📊 **Average Score** - Highest average performance
- ⭐ **Best Score** - Highest single-game score
- 🎯 **Accuracy Rate** - Best answer accuracy
- 🎮 **Games Played** - Most active players
- ✅ **Correct Answers** - Most questions answered correctly

All statistics are stored using a progressive flat-file system with append-only logs for durability and crash recovery.

## 📝 Development

### Running with Bun (optional)

If you have Bun installed:
```bash
bun install
bun run index.js
```

### Adding New Commands

1. Add command definition in `deploy-commands.js`
2. Add command handler in `index.js` under the `InteractionCreate` event
3. Run `npm run deploy-commands` to register the new command

See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-new-commands) for a walkthrough, including how to add subcommands and autocomplete (as used by `/ignorelist`).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📚 Additional Documentation

- [Progressive Storage System](./PROGRESSIVE_STORAGE.md) - Details about the append-only log system for durability
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Game Guide](./GAME_GUIDE.md) - How to play the game
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Discord.js Documentation](https://discord.js.org/)
- [Tezos](https://tezos.com/)
- [Discord Developer Portal](https://discord.com/developers/applications)

---

Made with ❤️ for The Tezos Community
