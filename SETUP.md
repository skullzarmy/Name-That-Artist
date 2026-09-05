# 🚀 Setup Guide - Name That Artist Bot

This guide will help you set up and run the Name That Artist Discord bot for The Tezos Community.

## Prerequisites

Before you begin, make sure you have:
- Node.js 20.x or higher installed (22.x/24.x LTS recommended — 18.x has reached end-of-life)
- A Discord account
- Access to the [Discord Developer Portal](https://discord.com/developers/applications)

## Step 1: Create a Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "Name That Artist - TTC")
4. Click "Create"

## Step 2: Create a Bot User

1. In your application, go to the "Bot" section (left sidebar)
2. Click "Add Bot" and confirm
3. Under "Privileged Gateway Intents", enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent (optional, for member counting)
4. Click "Save Changes"
5. Under "TOKEN", click "Reset Token" and copy it (save it securely!)

## Step 3: Get Your Application ID

1. Go to the "General Information" section (left sidebar)
2. Copy your "Application ID" (also called Client ID)

## Step 4: Configure the Bot

1. In the project directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   DISCORD_TOKEN=your_token_from_step_2
   CLIENT_ID=your_application_id_from_step_3
   ```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Deploy Slash Commands

Before the bot can use slash commands, you need to register them with Discord:

```bash
npm run deploy-commands
```

You should see:
```
✅ Successfully reloaded application (/) commands.
```

## Step 7: Invite the Bot to Your Server

1. Go back to the Discord Developer Portal
2. Navigate to "OAuth2" → "URL Generator"
3. Select the following scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Select the following bot permissions:
   - ✅ Send Messages
   - ✅ Send Messages in Threads
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use Slash Commands
5. Copy the generated URL at the bottom
6. Open the URL in your browser
7. Select a server and click "Authorize"

## Step 8: Start the Bot

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 Name That Artist - TTC Edition                      ║
║   The Tezos Community Discord Game                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Logged in as Your Bot Name#1234
🌐 Connected to 1 server(s)
```

## Testing the Bot

In your Discord server, try these commands:

- `/help` - View all available commands
- `/ping` - Check if the bot is responsive
- `/namethatartist` - Start a game (fetches real NFTs from TTC wallet!)
- `/leaderboard` - View top players
- `/stats` - View your personal statistics

**Note**: On first run, the bot will fetch all NFTs from the TTC wallet. This may take a minute or two. Subsequent runs will use cached data.

## How the Game Works

### Data Flow

1. **Token Fetching**: Bot automatically fetches NFTs from the TTC wallet using objkt.com GraphQL API
2. **Caching**: Tokens are cached in `data/tokens.json` for 24 hours
3. **Game Creation**: When `/namethatartist` is run, the bot selects 10 random NFTs
4. **Round Display**: Each round shows an NFT image and 4 artist choices (A/B/C/D)
5. **Player Interaction**: Players click buttons to answer within 15 seconds
6. **Scoring**: Correct answers earn points based on response speed
7. **Results**: After 10 rounds, final scores and winners are announced

### Data Storage

The bot stores data locally in JSON files:

- `data/tokens.json` - Cached NFT tokens from the wallet
- `data/players.json` - Player statistics and history
- `data/game_state.json` - Active game sessions (for recovery)
- `data/ignored_contracts.json` - Admin-managed list of NFT contracts excluded from game selection (via `/ignorelist`)

These files are automatically created and updated by the bot.

### Development Mode

To run the bot with auto-restart on file changes:

```bash
npm run dev
```

This is useful when developing new features.

### Running with Bun (Alternative)

If you have [Bun](https://bun.sh) installed:

```bash
bun install
bun run index.js
```

Bun provides faster startup times and is fully compatible with this project.

## Running in Production

The bot has no built-in daemonization — it's a single long-running Node process (`npm start`). On a Linux host, the simplest way to keep it running after you log out is a `screen` session:

```bash
# Start a named session and run the bot inside it
screen -S name-that-artist
cd /path/to/Name-That-Artist
npm start

# Detach without stopping the bot: press Ctrl+A, then D

# Reattach later to view logs or stop it
screen -r name-that-artist
```

Only run **one** instance of the bot against a given `data/` directory at a time — the append-only log storage (see [PROGRESSIVE_STORAGE.md](./PROGRESSIVE_STORAGE.md)) isn't safe for concurrent writers.

`screen` won't restart the bot automatically if it crashes or the host reboots. If you want that, a minimal `systemd` unit is a lightweight opt-in alternative to `screen`:

```ini
# /etc/systemd/system/name-that-artist.service
[Unit]
Description=Name That Artist Discord Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/Name-That-Artist
ExecStart=/usr/bin/node index.js
Restart=on-failure
User=your-linux-user

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now name-that-artist
journalctl -u name-that-artist -f   # view logs
```

## Troubleshooting

### Bot doesn't respond to commands

- Make sure you ran `npm run deploy-commands`
- Check that the bot has proper permissions in your Discord server
- Verify that "Message Content Intent" is enabled in the Discord Developer Portal

### "Invalid token" error

- Double-check your `DISCORD_TOKEN` in the `.env` file
- Make sure you copied the complete token without extra spaces
- You may need to regenerate the token in the Discord Developer Portal

### Bot connects but commands don't appear

- Run `npm run deploy-commands` again
- Wait a few minutes for Discord to update (can take up to an hour for global commands)
- Try kicking and re-inviting the bot

## Support

For issues or questions:
- Check the [main README](README.md)
- Review Discord.js documentation: https://discord.js.org/
- Open an issue in the GitHub repository

---

Made with ❤️ for The Tezos Community
