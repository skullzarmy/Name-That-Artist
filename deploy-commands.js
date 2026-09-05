import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.error("ERROR: DISCORD_TOKEN and CLIENT_ID must be set in .env file");
    process.exit(1);
}

// Define slash commands
const commands = [
    {
        name: "ping",
        description: "Check if the bot is alive and responsive",
    },
    {
        name: "namethatartist",
        description: "Start a new Name That Artist game - trivia with customizable rounds!",
        options: [
            {
                name: "rounds",
                description: "Number of rounds to play (default: 20, min: 5, max: 50)",
                type: 4, // INTEGER type
                required: false,
                min_value: 5,
                max_value: 50,
            },
            {
                name: "roundtime",
                description: "Seconds per round (default: 30, min: 10, max: 60)",
                type: 4, // INTEGER type
                required: false,
                min_value: 10,
                max_value: 60,
            },
            {
                name: "betweenroundtime",
                description: "Seconds between rounds (default: 30, min: 5, max: 60)",
                type: 4, // INTEGER type
                required: false,
                min_value: 5,
                max_value: 60,
            },
        ],
    },
    {
        name: "leaderboard",
        description: "View the top players on the leaderboard",
    },
    {
        name: "stats",
        description: "View your personal game statistics",
    },
    {
        name: "alltime",
        description: "View all-time leaderboards with various sorting options",
        options: [
            {
                name: "sort",
                description: "How to sort the leaderboard",
                type: 3, // STRING type
                required: false,
                choices: [
                    {
                        name: "Total Score",
                        value: "totalScore",
                    },
                    {
                        name: "Total Wins",
                        value: "totalWins",
                    },
                    {
                        name: "Average Score",
                        value: "averageScore",
                    },
                    {
                        name: "Best Score",
                        value: "bestScore",
                    },
                    {
                        name: "Accuracy Rate",
                        value: "accuracyRate",
                    },
                    {
                        name: "Games Played",
                        value: "totalGames",
                    },
                    {
                        name: "Correct Answers",
                        value: "totalCorrectAnswers",
                    },
                ],
            },
        ],
    },
    {
        name: "stopgame",
        description: "Stop the current game in this channel",
    },
    {
        name: "help",
        description: "Get help and information about the Name That Artist game",
    },
    {
        name: "precache",
        description: "Pre-load all game images into Discord's cache (Admin only)",
    },
    {
        name: "ignorelist",
        description: "Manage NFT contracts excluded from game selection (Admin only)",
        options: [
            {
                name: "add",
                description: "Add a contract to the ignore list",
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: "contract",
                        description: "Search by collection name or paste a KT1 contract address",
                        type: 3, // STRING
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "remove",
                description: "Remove a contract from the ignore list",
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: "contract",
                        description: "Search currently ignored contracts by name or address",
                        type: 3, // STRING
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "list",
                description: "View all currently ignored contracts",
                type: 1, // SUB_COMMAND
            },
        ],
    },
];

// Create REST instance
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log("🚀 Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log("✅ Successfully reloaded application (/) commands.");
        console.log("\nRegistered commands:");
        commands.forEach((cmd) => {
            console.log(`  - /${cmd.name}: ${cmd.description}`);
        });
    } catch (error) {
        console.error("❌ Error deploying commands:", error);
        process.exit(1);
    }
})();
