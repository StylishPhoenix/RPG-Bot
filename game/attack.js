const { MessageActionRow, MessageButton } = require('discord.js');
const { getPlayerByUserId, updatePlayerHealth } = require('../playerData');
const { revive } = require('./revive');

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

	while (player.health > 0 && enemy.health > 0 && !playerHasRun) {
	  let message = '';
      const buttonInteraction = await new Promise(resolve => {
        const filter = i => i.user.id === userId && i.isButton();

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1 });

        collector.on('collect', i => {
          resolve(i);
          collector.stop();
        });
      });
	  await buttonInteraction.deferUpdate();
      if (buttonInteraction.customId === 'run') {
        playerHasRun = true;
        await buttonInteraction.reply('You successfully ran away from the battle.');
        await interaction.editReply({ components: [] });
      } else if (buttonInteraction.customId === 'fight') {
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
              await revive(interaction, userId, player);
	      message += `\nThe gods look kindly upon you, and grant you another chance!  Your health is now ${player.health}.`;
	      await interaction.editReply(`\n${message}`);
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
  } catch (error) {
    console.error(error);
    return interaction.editReply({ content: 'There was an error while retrieving your character!', ephemeral: true });
  }
}


module.exports = {
  attack,
};
