const Joi = require('joi')

const layoutObject = {
    name: Joi.string().required(),

    elements: Joi.object().pattern(Joi.string(), Joi.object()),
    components: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    forms: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    styles: Joi.object(),
    updater: Joi.object().allow(null),
    creator: Joi.object().allow(null),
}

const layoutSchema = {
    body: Joi.object().keys(layoutObject),
}

const elementObject = {
    _elements: Joi.object().pattern(Joi.string(), Joi.object()),
    main: Joi.string().allow(''),

    _events: Joi.object().allow({}),
    _states: Joi.object().allow({}),
    _components: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    _forms: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    updater: Joi.object().allow({}),
}

const elementsSchema = {
    body: Joi.object().keys(elementObject),
}

const styleObject = {
    _styles: Joi.object(),
    updater: Joi.object().allow({}),
}

const styleSchema = {
    body: Joi.object().keys(styleObject),
}

module.exports = {
    layoutSchema,
    elementsSchema,
    styleSchema,
}
