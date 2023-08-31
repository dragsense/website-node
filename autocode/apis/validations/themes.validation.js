const Joi = require('joi');

const themesObject= {
};


const themesSchema = {
    body: Joi.object().keys(themesObject)
}

module.exports = {
    themesSchema,
};