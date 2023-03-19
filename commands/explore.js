// commands/explore.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { getRandomEnemy } = require('../game/enemies');
const { getPlayerByUserId } = require('../playerData');
const { attack } = require('../game/attack');

const encounterChance = 0.3;

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

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('fight')
                            .setLabel('Fight')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('run')
                            .setLabel('Run')
                            .setStyle('SECONDARY')
                    );

                await interaction.reply({ content: `You've encountered a ${enemy.name}! What will you do?`, components: [row], fetchReply: true });

                const filter = i => i.user.id === userId;
                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'fight') {
                        await i.deferUpdate();
                        collector.stop();
                        await attack(interaction, userId, player, enemy);
                    } else if (i.customId === 'run') {
                        await i.update({ content: `You ran away from the ${enemy.name}.`, components: [] });
                    }
                });

                collector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        collector.stop();
                        interaction.editReply({ content: 'You took too long to decide. The enemy got away.', components: [] });
                    }
                });

            } else {
                await interaction.editReply('You explored the dungeon but found nothing.');
            }
        });
    }
};
