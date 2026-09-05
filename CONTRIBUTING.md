# 🤝 Contributing to Name That Artist

Thank you for your interest in contributing to the Name That Artist bot for The Tezos Community! This document will guide you through the contribution process.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Name-That-Artist.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the [SETUP.md](SETUP.md) guide to get the bot running locally

## Project Structure

```
Name-That-Artist/
├── index.js              # Main bot entry point and event handlers
├── game.js               # Game logic and session management
├── config.js             # Configuration and environment variables
├── deploy-commands.js    # Slash command registration
├── package.json          # Dependencies and scripts
├── .env.example          # Example environment variables
├── README.md             # Main documentation
├── SETUP.md             # Setup instructions
└── CONTRIBUTING.md      # This file
```

## Development Guidelines

### Code Style

- Use ES6+ features (async/await, arrow functions, etc.)
- Use 4 spaces for indentation
- Add comments for complex logic
- Follow existing code patterns in the project

### Adding New Commands

1. **Define the command** in `deploy-commands.js`:
   ```javascript
   {
       name: 'mycommand',
       description: 'Description of what the command does',
   }
   ```

2. **Add the handler** in `index.js` under the `InteractionCreate` event:
   ```javascript
   if (commandName === 'mycommand') {
       await interaction.reply({
           content: 'Command response',
           ephemeral: false // or true for private responses
       });
   }
   ```

3. **Deploy the command**:
   ```bash
   npm run deploy-commands
   ```

For a set of related actions (e.g. add/remove/list), use subcommands instead of separate top-level commands — see `ignorelist` in `deploy-commands.js` for a working example:

```javascript
{
    name: 'mycommand',
    description: 'Description of what the command does',
    options: [
        {
            name: 'add',
            description: 'Add something',
            type: 1, // SUB_COMMAND
            options: [
                { name: 'value', description: '...', type: 3, required: true }, // STRING
            ],
        },
        { name: 'list', description: 'List everything', type: 1 },
    ],
}
```

Route it in `index.js` with `interaction.options.getSubcommand()`:

```javascript
if (commandName === 'mycommand') {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'add') { /* ... */ }
    if (subcommand === 'list') { /* ... */ }
}
```

If an option should offer live suggestions as the admin types (`autocomplete: true` on the option), handle it in `handleAutocomplete()` in `index.js`, which is routed separately via `interaction.isAutocomplete()`.

### Adding Game Features

Game logic lives in `game.js`. The `NameThatArtistGame` class manages:
- Active game sessions
- Artist data
- Game state
- Hint system

Example of adding a new game method:

```javascript
// In game.js
export class NameThatArtistGame {
    // ... existing methods ...
    
    myNewFeature(channelId) {
        const session = this.activeSessions.get(channelId);
        if (!session) {
            return { success: false, message: 'No active game' };
        }
        
        // Your logic here
        return { success: true, /* your data */ };
    }
}
```

### Adding Artist Data

To add Tezos artists to the game:

1. Open `game.js`
2. Add artist objects to `SAMPLE_ARTISTS`:

```javascript
const SAMPLE_ARTISTS = [
    {
        name: 'Artist Name',
        artworks: [
            'https://url-to-artwork.jpg',
            // Add more artwork URLs
        ],
        bio: 'Brief description of the artist'
    },
    // Add more artists...
];
```

**Important**: Ensure you have permission to use the artwork URLs and artist information.

## Testing Your Changes

1. Run the bot locally: `npm start` or `npm run dev`
2. Test in a private Discord server
3. Try all relevant commands
4. Check for error messages in the console
5. Verify the bot responds appropriately

### Test Checklist

- [ ] Bot starts without errors
- [ ] Commands are registered (`/help` shows them)
- [ ] New features work as expected
- [ ] Error cases are handled gracefully
- [ ] No console errors or warnings
- [ ] Code follows project style

## Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `style:` for formatting changes
   - `test:` for adding tests

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with:
     - Description of changes
     - Why the changes are needed
     - How to test the changes
     - Screenshots (if UI changes)

## Ideas for Contributions

### Features to Add

- 🎯 **Leaderboard system** - Track player scores
- ⏱️ **Time-based challenges** - Add difficulty levels
- 🖼️ **Multiple choice mode** - Show artist options
- 🎨 **Category system** - Filter by art style/medium
- 📊 **Statistics** - Track game stats per user
- 🌐 **Multi-language support** - Internationalization
- 💾 **Database integration** - Persistent data storage
- 🎁 **Rewards system** - Virtual rewards for winners
- 📱 **Mobile-friendly embeds** - Better mobile UI
- 🔊 **Voice channel integration** - Audio hints

### Bug Fixes and Improvements

- Better error messages
- Performance optimizations
- Code documentation
- Unit tests
- Integration tests
- CI/CD pipeline
- Docker support

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow
- Celebrate contributions of all sizes

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Reach out to maintainers for guidance

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to The Tezos Community! 🎨
