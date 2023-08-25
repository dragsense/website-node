const Joi = require('joi');

const mediaObject= {
  src: Joi.string(),
  fileName: Joi.string(),

  name: Joi.string().required(),
  type: Joi.string(),
  alt: Joi.string().required(),
  size: Joi.number().default(0),
  dimensions: Joi.object().default({}),
  mimetype: Joi.string().default(''),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const mediaSchema = {
    body: Joi.object().keys(mediaObject)
}

module.exports = {
    mediaSchema,
};