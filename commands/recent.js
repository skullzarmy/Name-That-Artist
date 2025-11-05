import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { loadPlayers } from '../services/storage.js';

export default {
    data: new SlashCommandBuilder()
        .setName('recent')
        .setDescription('View recent game winners and their scores'),
    
    async execute(interaction) {
        try {
            const players = loadPlayers();
            
            // Get all player entries with game history
            const recentGames = [];
            
            for (const [userId, playerData] of Object.entries(players)) {
                if (playerData.gamesPlayed > 0) {
                    recentGames.push({
                        userId,
                        username: playerData.username || 'Unknown Player',
                        lastScore: playerData.bestScore || 0,
                        wins: playerData.wins || 0,
                        lastPlayed: playerData.lastPlayed || Date.now()
                    });
                }
            }
            
            // Sort by most recent play time
            recentGames.sort((a, b) => b.lastPlayed - a.lastPlayed);
            
            // Take top 10 most recent
            const topRecent = recentGames.slice(0, 10);
            
            if (topRecent.length === 0) {
                return interaction.reply({
                    content: '🎮 No recent games found. Start a new game with `/namethatartist`!',
                    ephemeral: true
                });
            }
            
            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎮 Recent Game Activity')
                .setDescription('Latest players and their performances')
                .setTimestamp()
                .setFooter({ text: 'TTC Name That Artist' });
            
            // Add players to embed
            let description = '';
            topRecent.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                const timeAgo = getTimeAgo(player.lastPlayed);
                description += `${medal} **${player.username}**\n`;
                description += `   Score: ${player.lastScore} | Wins: ${player.wins} | ${timeAgo}\n\n`;
            });
            
            embed.addFields({
                name: 'Recent Players',
                value: description || 'No data available'
            });
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in /recent command:', error);
            await interaction.reply({
                content: '❌ An error occurred while fetching recent games.',
                ephemeral: true
            });
        }
    }
};

// Helper function to format time ago
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}