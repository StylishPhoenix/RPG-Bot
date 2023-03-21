const { MessageActionRow, MessageButton } = require('discord.js');
const { getRandomEnemy } = require('../game/enemies');
const { getPlayerByUserId, updatePlayerHealth } = require('../playerData');

function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.attack - defender.defense, 1);
  return damage;
}

async function attack(interaction, userId, player, enemy) {
  getPlayerByUserId(userId, async (error, player) => {
    if (error || !player) {
      console.error(error);
      return interaction.editReply({ content: 'There was an error while retrieving your character!', ephemeral: true });
    });

    const enemy = getRandomEnemy();
    let playerHasRun = false;

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

      
      // Send the message and add fight and run buttons
      const filter = i => i.user.id === userId;
      await interaction.editReply({ content: `You've encountered a ${enemy.name}! What will you do?`, components: [row], fetchReply: true });

    if (playerHasRun) {
      await interaction.editReply('You successfully ran away from the battle.');
    } 

    while (player.health > 0 && enemy.health > 0 && !playerHasRun) {
      let message = '';
         const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });
         const collected = await new Promise((resolve) => collector.on('collect', (i) => resolve(i)));
         if (collected.customId === 'run') {
            playerHasRun = true;
            break;
         }
        // Player attacks enemy
        const playerDamage = calculateDamage(player, enemy);
        enemy.health -= playerDamage;
        message += `\nYou dealt ${playerDamage} damage to the enemy ${enemy.name}.`;

        if (enemy.health <= 0) {
          message += `\nYou defeated the enemy ${enemy.name}!`;
          await interaction.editReply('\n${message}');
          break;
      } else {
        // Enemy attacks player
        const enemyDamage = calculateDamage(enemy, player);
        player.health -= enemyDamage;
        message += `\nThe enemy ${enemy.name} dealt ${enemyDamage} damage to you.`;

        if (player.health <= 0) {
          message += `\nYou have been defeated by the enemy ${enemy.name}.`;
          break;
        } else {
          message += `\nYour health is now ${player.health}.`;
          await interaction.editReply('\n${message}');
        }
      }

      // Remove player's reactions for the next iteration
      collector.stop();
      // Save player's updated health to the database
      updatePlayerHealth(userId, player.health, (updateError) => {
        if (updateError) {
          console.error(updateError);
        }
      });

  }
}

module.exports = {
  attack,
};
