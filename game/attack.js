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
    }

    const enemy = getRandomEnemy();
    let isPlayerTurn = true;
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

    const filter = i => i.user.id === userId;

    while (player.health > 0 && enemy.health > 0 && !playerHasRun) {
      let message = '';

      if (isPlayerTurn) {
        // Player attacks enemy
        const playerDamage = calculateDamage(player, enemy);
        enemy.health -= playerDamage;
        message += `You dealt ${playerDamage} damage to the enemy ${enemy.name}.`;

        if (enemy.health <= 0) {
          message += `\nYou defeated the enemy ${enemy.name}!`;
          break;
        }
      } else {
        // Enemy attacks player
        const enemyDamage = calculateDamage(enemy, player);
        player.health -= enemyDamage;
        message += `The enemy ${enemy.name} dealt ${enemyDamage} damage to you.`;

        if (player.health <= 0) {
          message += `\nYou have been defeated by the enemy ${enemy.name}.`;
          break;
        } else {
          message += `\nYour health is now ${player.health}.`;
        }
      }

      // Toggle player turn
      isPlayerTurn = !isPlayerTurn;

      // Save player's updated health to the database
      updatePlayerHealth(userId, player.health, (updateError) => {
        if (updateError) {
          console.error(updateError);
        }
      });

      
      // Send the message and add fight and run buttons
      await interaction.editReply({ content: `${message}\nWhat do you do?`, components: [row], fetchReply: true });

      const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

      const collected = await new Promise((resolve) => collector.on('collect', (i) => resolve(i)));

      if (collected.customId === 'run') {
        playerHasRun = true;
        break;
      }
      // Remove player's reactions for the next iteration
      collector.stop();
    }

    if (playerHasRun) {
      await interaction.editReply('You successfully ran away from the battle.');
    } else {
      await interaction.editReply(`Battle ended. Your health is now ${player.health}.`);
    }

  });
}

module.exports = {
  attack,
};
