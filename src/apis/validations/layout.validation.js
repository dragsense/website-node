const Joi = require('joi');

const layoutObject= {
  name: Joi.string().required(),
  topComponent: Joi.boolean().default(false),
  bottomComponent: Joi.boolean().default(false),
  components: Joi.object({
      top: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).default(null),
      bottom: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).default(null),
  }).default({}),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const layoutSchema = {
    body: Joi.object().keys(layoutObject)
}

module.exports = {
    layoutSchema,
};