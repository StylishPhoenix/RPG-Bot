// game/enemies.js
const enemies = [
  {
    name: 'Space Pirate',
    health: 50,
    attack: 10,
    defense: 5,
  },
  {
    name: 'Alien Invader',
    health: 75,
    attack: 15,
    defense: 10,
  },
  {
    name: 'Asteroid Monster',
    health: 100,
    attack: 20,
    defense: 15,
  },
];

function getRandomEnemy() {
  const index = Math.floor(Math.random() * enemies.length);
  return enemies[index];
}

module.exports = {
  enemies,
  getRandomEnemy,
};
