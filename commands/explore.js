// commands/explore.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { getRandomEnemy } = require('../game/enemies');
const { getPlayerByUserId } = require('../playerData');
const { attack } = require('../game/attack');

const encounterChance = 1;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore a dungeon and encounter enemies'),

    async execute(interaction) {
        const userId = interaction.user.id;

        getPlayerByUserId(userId, async (error, player) => {
            if (error || !player) {
                console.error(error);
                return interaction.reply({ content: 'There was an error while retrieving your character!', ephemeral: true });
            }
            await interaction.deferReply();
            
            // Check if the player encounters an enemy
            if (Math.random() < encounterChance) {
                const enemy = getRandomEnemy();
                await attack(interaction, userId, player, enemy);
                });

            } else {
                await interaction.editReply('You explored the dungeon but found nothing.');
            }
        });
    }
};
