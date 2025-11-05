# Recent Games Command

A Discord slash command that displays recent game activity and winners for the Name That Artist bot.

## Description

The `/recent` command shows the 10 most recent players who have participated in Name That Artist games, along with their scores, wins, and how long ago they played.

## Features

- 📊 Shows last 10 players who played
- 🏆 Displays player scores and win counts
- ⏰ Shows time since last game (e.g., "5m ago", "2h ago")
- 🎨 Beautiful embed with TTC branding
- 🥇 Medal indicators for top 3 recent players
- ⚡ Fast response using cached player data

## Usage

Simply type in Discord:
```
/recent
```

The bot will display an embed showing:
- Player username
- Their last score
- Total wins
- Time since they last played

## Output Example

```
🎮 Recent Game Activity

🥇 Alice
   Score: 850 | Wins: 5 | 2m ago

🥈 Bob
   Score: 720 | Wins: 3 | 15m ago

🥉 Charlie
   Score: 690 | Wins: 2 | 1h ago

4. David
   Score: 550 | Wins: 1 | 3h ago
```

## Implementation Details

### Dependencies
- `discord.js` - For slash commands and embeds
- `storage.js` service - Loads player data from local storage

### Data Source
Reads from `data/players.json` which tracks:
- Player usernames
- Game scores
- Win counts
- Last played timestamps

### Time Formatting
Automatically formats timestamps to human-readable format:
- Under 1 minute: "30s ago"
- Under 1 hour: "45m ago"
- Under 1 day: "3h ago"
- 1 day or more: "2d ago"

## Integration

### Adding to Your Bot

1. Place this file in the `commands/` directory
2. The command will be auto-loaded by the bot's command handler
3. Run `npm run deploy-commands` to register with Discord
4. Restart the bot

### Storage Requirements

Requires the `storage.js` service to track a `lastPlayed` field. Update the storage service to track:

```javascript
{
    "userId": {
        "username": "PlayerName",
        "bestScore": 850,
        "wins": 5,
        "lastPlayed": 1698765432000  // Unix timestamp
    }
}
```

## Author

**Ashvin**
- GitHub: [@ashvin2005](https://github.com/ashvin2005)
- LinkedIn: [ashvin-tiwari](https://linkedin.com/in/ashvin-tiwari)

## Hacktoberfest 2025

Created for Hacktoberfest 2025 🎃

## License

MIT License - Same as the Name That Artist project