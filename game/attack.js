const { MessageActionRow, MessageButton } = require('discord.js');
const { getPlayerByUserId, updatePlayerHealth } = require('../playerData');

function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.attack - defender.defense, 1);
  return damage;
}

async function attack(client, interaction, userId, player, enemy) {
  try {
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

    // Handle button click events
    client.on('interactionCreate', async interaction => {
      if (interaction.isButton() && interaction.user.id === userId && interaction.message.id === interaction.message.id) {
	  let message = '';
        if (interaction.customId === 'run') {
          playerHasRun = true;
          await interaction.followUp('You successfully ran away from the battle.');
          await interaction.editReply({ components: [] });
        } else if (interaction.customId === 'fight') {
          // Player attacks enemy
          const playerDamage = calculateDamage(player, enemy);
          enemy.health -= playerDamage;
          message += `\nYou dealt ${playerDamage} damage to the enemy ${enemy.name}.`;

          if (enemy.health <= 0) {
            message += `\nYou defeated the enemy ${enemy.name}!`;
            await interaction.followUp(`\n${message}`);
            await interaction.editReply({ components: [] });
            return;
          } else {
            // Enemy attacks player
            const enemyDamage = calculateDamage(enemy, player);
            player.health -= enemyDamage;
            message += `\nThe enemy ${enemy.name} dealt ${enemyDamage} damage to you.`;

            if (player.health <= 0) {
              message += `\nYou have been defeated by the enemy ${enemy.name}.`;
              await interaction.followUp(`\n${message}`);
              await interaction.editReply({ components: [] });
              return;
            } else {
              message += `\nYour health is now ${player.health}.`;
              await interaction.editReply(`\n${message}`);
            }
          }

          // Save player's updated health to the database
          updatePlayerHealth(userId, player.health, (updateError) => {
            if (updateError) {
              console.error(updateError);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return interaction.editReply({ content: 'There was an error while retrieving your character!', ephemeral: true });
  }
}

module.exports = {
  attack,
};
