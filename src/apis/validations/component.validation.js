const Joi = require('joi');

const componentObject = {
  name: Joi.string().required(),
  parent: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(""),
  type: Joi.string().default('component'),
  attached: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(""),

  elements: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  states: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  components: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  forms: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  styles: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const componentSchema = {
  body: Joi.object().keys(componentObject)
}


const elementObject = {
  elements: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  collStates: Joi.object().allow({}),
  components: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  forms: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  updater: Joi.object().allow({}),
};


const elementsSchema = {
  body: Joi.object().keys(elementObject)
}

const styleObject = {
  styles: Joi.object(),
  updater: Joi.object().allow({}),
};


const styleSchema = {
  body: Joi.object().keys(styleObject)
}



module.exports = {
  componentSchema,
  elementsSchema,
  styleSchema

};

