const mongoose = require('mongoose');
const env = require("../configs/env");
const { executeCommand } = require('./utils');



async function takeSnapshot(path) {
  const command = `mongodump --archive=${path} --gzip --db ${env.database.name}`;
  await executeCommand(command)

}

async function restoreSnapshot(path) {
  const command = `mongorestore --archive=${path} --gzip --db ${env.database.name}`;
  await executeCommand(command);
}

module.exports = {
  takeSnapshot,
  restoreSnapshot
}
