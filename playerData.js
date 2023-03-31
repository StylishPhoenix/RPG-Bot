// playerData.js
const db = require('./database');

function createPlayer(userId, name, characterClass, callback) {
  // Define initial player stats based on class
  let health, attack, defense;
  switch (characterClass) {
    case 'warrior':
      health = maxHealth = 100;
      attack = 15;
      defense = 15;
      break;
    case 'mage':
      health = maxHealth = 75;
      attack = 20;
      defense = 5;
      break;
    case 'rogue':
      health = maxHealth = 85;
      attack = 15;
      defense = 10;
      break;
    default:
      return callback(new Error('Invalid character class'));
  }

  db.run(
    `INSERT INTO players (user_id, name, class, health, maxHealth, attack, defense) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, characterClass, health, maxHealth, attack, defense],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: this.lastID,
        userId,
        name,
        characterClass,
        health,
        maxHealth,
        attack,
        defense,
      });
    }
  );
}

function getPlayerByUserId(userId, callback) {
  if (!db) {
    return callback(new Error('Database not initialized'));
  }
  db.get(`SELECT * FROM players WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      return callback(err);
    }
    if (!row) {
      return callback(new Error(`Player with user ID ${userId} not found`));
    }
    callback(null, row);
  });
}

function updatePlayerHealth(userId, newHealth, callback) {
  db.run(`UPDATE players SET health = ? WHERE user_id = ?`, [newHealth, userId], function (err) {
    if (err) {
      return callback(err);
    }
    if (this.changes === 0) {
      return callback(new Error('No player found with the specified user ID'));
    }
    callback(null);
  });
}

module.exports = {
  createPlayer,
  getPlayerByUserId,
  updatePlayerHealth,
};
