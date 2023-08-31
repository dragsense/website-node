const Joi = require('joi');

const collectionObject = {
  name: Joi.string().required(),
  slug: Joi.string().required(),
  layout: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  type: Joi.string().default('collection'),

  scripts: Joi.object({
    head: Joi.string().allow(''),
    footer: Joi.string().allow(''),
  }),
  url: Joi.string(),
  elements: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
  relationships: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
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
  setting: Joi.object({
    title: Joi.string().allow(''),
    desc: Joi.string().allow(''),
    image: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(""),
    content: Joi.string().allow(''),
    excerpt: Joi.string().allow(''),
    status: Joi.string().default('DRAFT'),
  }).default({}),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const collectionSchema = {
  body: Joi.object().keys(collectionObject)
}


const elementObject = {
  elements: Joi.object().pattern(
    Joi.string(),
    Joi.object()
  ),
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
  collectionSchema,
  elementsSchema,
  styleSchema

};

