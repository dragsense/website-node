const Joi = require('joi');

const documentObject = {
  name: Joi.string().required(),
  slug: Joi.string().required(),
  url: Joi.string(),
  relationships: Joi.object().pattern(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  ),
  states: Joi.object().pattern(
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


const documentSchema = {
  body: Joi.object().keys(documentObject)
}

const filterDocObject = {
  filters: Joi.array()
  .items(
    Joi.object({
      filterKey: Joi.array()
        .items().default([]),
      defaultValue: Joi.string().allow(""),
    })
  )
  .default([]),
  selectedRelationships: Joi.array()
    .items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .default([]),
  withRelationship: Joi.boolean().default(false),
};


const filterDocSchema = {
  body: Joi.object().keys(filterDocObject)
}

const filterObject = {
  filters: Joi.array()
    .items(
      Joi.object({
        filterKey: Joi.array()
          .items().default([]),
        defaultValue: Joi.string().allow(""),
      })
    )
    .default([]),
  selectedRelationships: Joi.array()
    .items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .default([]),
  withRelationship: Joi.boolean().default(false),
};


const filterSchema = {
  body: Joi.object().keys(filterObject)
}

module.exports = {
  documentSchema,
  filterSchema,
  filterDocSchema
};