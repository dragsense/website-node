const crypto = require('crypto');

const env = require("../configs/env");

const iv = crypto.randomBytes(16);

// Encrypt JSON data
const encrypt = (data) => {
  const cipher = crypto.createCipheriv(env.jsonEncrypt.algorithm, env.jsonEncrypt.key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
};

// Decrypt JSON data
const decrypt = (encryptedData, iv) => {
  const decipher = crypto.createDecipheriv(env.jsonEncrypt.algorithm, env.jsonEncrypt.key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

module.exports = {
    encrypt,
    decrypt
}

