const { MessageCollector } = require('discord.js');
const { getRandomEnemy } = require('../game/enemies');
const { getPlayerByUserId, updatePlayerHealth } = require('../playerData');

function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.attack - defender.defense, 1);
  return damage;
}

async function attack(interaction, player, enemy) {
  getPlayerByUserId(userId, async (error, player) => {
    if (error || !player) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while retrieving your character!', ephemeral: true });
    }

    const enemy = getRandomEnemy();
    let isPlayerTurn = true;
    let playerHasRun = false;

    while (player.health > 0 && enemy.health > 0 && !playerHasRun) {
      let message = '';

      if (isPlayerTurn) {
        // Player attacks enemy
        const playerDamage = calculateDamage(player, enemy);
        enemy.health -= playerDamage;
        message = `You dealt ${playerDamage} damage to the enemy ${enemy.name}.`;

        if (enemy.health <= 0) {
          message += `\nYou defeated the enemy ${enemy.name}!`;
          break;
        }
      } else {
        // Enemy attacks player
        const enemyDamage = calculateDamage(enemy, player);
        player.health -= enemyDamage;
        message = `The enemy ${enemy.name} dealt ${enemyDamage} damage to you.`;

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

      // Send the message and add fight and run reactions
      const fightEmoji = '⚔️';
      const runEmoji = '🏃';

      const sentMessage = await interaction.reply({ content: `${message}\nReact with ${fightEmoji} to fight or ${runEmoji} to run.`, fetchReply: true });

      await sentMessage.react(fightEmoji);
      await sentMessage.react(runEmoji);

      // Create a ReactionCollector to listen for the player's reaction
      const filter = (reaction, user) => {
        return [fightEmoji, runEmoji].includes(reaction.emoji.name) && user.id === userId;
      };

      const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 30000 });

      // Wait for the player's reaction and check if they chose to run or fight
      const collected = await new Promise((resolve) => collector.on('collect', (reaction) => resolve(reaction)));

      if (collected.emoji.name === runEmoji) {
        playerHasRun = true;
        break;
      }

      // Remove player's reactions for the next iteration
      sentMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
      }

      if (playerHasRun) {
        await interaction.reply('You successfully ran away from the battle.');
        } else {
        await interaction.reply(`Battle ended. Your health is now ${player.health}.`);
      }
  });
}

module.exports = {
  attack,
};
