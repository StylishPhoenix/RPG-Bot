// commands/attack.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRandomEnemy } = require('../game/enemies');
const { getPlayerByUserId } = require('../playerData');

function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.attack - defender.defense, 1);
  return damage;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Attack a random enemy in the game'),
  async execute(interaction) {
    const userId = interaction.user.id;

    getPlayerByUserId(userId, async (error, player) => {
      if (error || !player) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while retrieving your character!', ephemeral: true });
      }

      const enemy = getRandomEnemy();

      // Player attacks enemy
      const playerDamage = calculateDamage(player, enemy);
      enemy.health -= playerDamage;

      let message = `You dealt ${playerDamage} damage to the enemy ${enemy.name}.`;

      if (enemy.health <= 0) {
        message += `\nYou defeated the enemy ${enemy.name}!`;
      } else {
        // Enemy attacks player
        const enemyDamage = calculateDamage(enemy, player);
        player.health -= enemyDamage;

        message += `\nThe enemy ${enemy.name} dealt ${enemyDamage} damage to you.`;

        if (player.health <= 0) {
          message += `\nYou have been defeated by the enemy ${enemy.name}.`;
        } else {
          message += `\nYour health is now ${player.health}.`;

       // Save player's updated health to the database
       updatePlayerHealth(userId, player.health, (updateError) => {
            if (updateError) {
              console.error(updateError);
            }
          });
        }
      }

      await interaction.reply(message);
    });
  },
};
