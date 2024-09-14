const Joi = require('joi');

const themesObject= {
    themeId: Joi.string(),
    projectId: Joi.string(),
    url: Joi.string().uri()
};


const themesSchema = {
    body: Joi.object().keys(themesObject)
}

module.exports = {
    themesSchema,
};