const fs = require('fs/promises');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'users.json');

async function readUsers() {
  const content = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(content);
}

async function saveUsers(users) {
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2), 'utf8');
}

module.exports = { readUsers, saveUsers };
