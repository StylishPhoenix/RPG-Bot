const { getPlayerByUserId, updatePlayerHealth } = require('../playerData');

async function revive(interaction, userId, player) {
  // Define the amount of health to restore when reviving
  const reviveHealth = Math.floor(player.maxHealth * 0.5);

  // Update player's health in the database
  updatePlayerHealth(userId, reviveHealth, (error) => {
    if (error) {
      console.log('Player max health:', player.maxHealth);
      console.error(error);
      return interaction.editReply({ content: 'There was an error while reviving your character!', ephemeral: true });
    }
  });
}

module.exports = {
  revive,
};
