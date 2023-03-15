// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./playerData.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});


db.run(`CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  health INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL
)`);


module.exports = db;
