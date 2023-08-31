const Joi = require('joi');

const templateObject= {
  name: Joi.string().required(),
  desc: Joi.string(),
  screenShotId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  elements: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  categories: Joi.array().items(Joi.string()),
  styles: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const templateSchema = {
    body: Joi.object().keys(templateObject)
}

module.exports = {
    templateSchema,
};