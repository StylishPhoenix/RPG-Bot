// commands/create-character.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createPlayer } = require('../playerData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-character')
    .setDescription('Create a new character for the game')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of your character')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('class')
        .setDescription('The class of your character')
        .setRequired(true)
        .addChoices([
          ['Warrior', 'warrior'],
          ['Mage', 'mage'],
          ['Rogue', 'rogue'],
        ])
    ),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const characterClass = interaction.options.getString('class');
        const userId = interaction.user.id;

        createPlayer(userId, name, characterClass, (error, player) => {
            if (error) {
                console.error(error);
                return interaction.reply({ content: 'There was an error while creating your character!', ephemeral: true });
            }

            interaction.reply(`Character "${player.name}" created with class "${player.class}"!`);
        });
    },
};
