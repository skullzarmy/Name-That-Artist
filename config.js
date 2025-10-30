/**
 * Configuration file for Name That Artist bot
 * TTC (The Tezos Community) Edition
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Bot configuration
export const config = {
    // Discord credentials
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,

    // Environment
    environment: process.env.NODE_ENV || "production",
    isDevelopment: process.env.NODE_ENV === "development",

    // Bot settings
    bot: {
        name: "Name That Artist",
        version: "1.0.0",
        description: "Discord game for The Tezos Community",
        prefix: "TTC",
    },

    // Game settings
    game: {
        roundsPerGame: 20, // Number of rounds in a game (default)
        roundTimeSeconds: 15, // Time per round in seconds
        delayBetweenRounds: 5, // Delay between rounds in seconds
        multipleChoiceCount: 4, // Number of answer choices (1 correct + 3 wrong)
        baseScore: 100, // Base score per correct answer
        minPlayers: 1, // Minimum players to start
        maxPlayers: 20, // Maximum players per game
        tokenRefreshHours: 24, // Hours before refreshing token cache
        excludeUnresolvedArtists: true, // Exclude artists without alias or tzdomain
    },

    // Branding
    branding: {
        name: "The Tezos Community",
        shortName: "TTC",
        color: 0x2c7df6, // Tezos blue
        emoji: "🎨",
    },

    // Cooldown settings (in seconds)
    cooldowns: {
        // Permissions that allow bypassing cooldowns
        bypassPermissions: ["Administrator", "ManageMessages"],

        // Command-specific cooldowns
        commands: {
            // Start game command - prevent spam
            namethatartist: {
                user: 30, // Per-user cooldown: 30 seconds
                channel: 5, // Per-channel cooldown: 5 seconds (prevents rapid game creation)
            },
            // Leaderboard command - reduce API spam
            leaderboard: {
                user: 10, // Per-user cooldown: 10 seconds
                channel: 0, // No channel cooldown
            },
            // All-time leaderboard command - similar to leaderboard
            alltime: {
                user: 10, // Per-user cooldown: 10 seconds
                channel: 0, // No channel cooldown
            },
            // Stats command - personal stats, light rate limiting
            stats: {
                user: 5, // Per-user cooldown: 5 seconds
                channel: 0, // No channel cooldown
            },
            // Stop game - moderator action, minimal cooldown
            stopgame: {
                user: 3, // Per-user cooldown: 3 seconds
                channel: 0, // No channel cooldown
            },
            // Help and ping - very light rate limiting
            help: {
                user: 10, // Per-user cooldown: 10 seconds
                channel: 0, // No channel cooldown
            },
            ping: {
                user: 5, // Per-user cooldown: 5 seconds
                channel: 0, // No channel cooldown
            },
        },
    },
};

// Validate required configuration
export function validateConfig() {
    const errors = [];

    if (!config.token) {
        errors.push("DISCORD_TOKEN is not set");
    }

    if (!config.clientId) {
        errors.push("CLIENT_ID is not set (required for slash commands)");
    }

    if (errors.length > 0) {
        console.error("❌ Configuration errors:");
        errors.forEach((error) => console.error(`   - ${error}`));
        return false;
    }

    return true;
}

export default config;
