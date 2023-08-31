const Joi = require('joi');

const backupObject= {
  _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
};


const backupSchema = {
    body: Joi.object().keys(backupObject)
}

module.exports = {
    backupSchema,
};