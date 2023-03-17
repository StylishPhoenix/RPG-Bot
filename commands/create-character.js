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
        .addChoices(
          { name: 'Warrior', value: 'warrior' },
          { name: 'Mage', value: 'mage' },
          { name: 'Rogue', value: 'rogue' },
        )
    ),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const characterClass = interaction.options.getString('class');
        const userId = interaction.user.id;

    getPlayerByUserId(userId, async (error, existingPlayer) => {
      if (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while checking for an existing character.', ephemeral: true });
      } else if (existingPlayer) {
        await interaction.reply({ content: 'You already have a character. You cannot create another one.', ephemeral: true });
      } else {
        createPlayer(userId, name, characterClass, async (createError, player) => {
          if (createError) {
            console.error(createError);
            await interaction.reply({ content: 'There was an error while creating your character.', ephemeral: true });
          } else {
            await interaction.reply(`You have created a new character named "${player.name}" with the class "${player.characterClass}".`);
          }
        });
    },
};
