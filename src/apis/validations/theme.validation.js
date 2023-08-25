const Joi = require('joi')


const colorSchema = {
    body: Joi.object().keys({
        name: Joi.string().required().min(2),
        color: Joi.string().required(),
    }),
}



const fontSchema = {
    body: Joi.object().keys({
        name: Joi.string().required().min(2),
        fontFamily: Joi.string().required(),
        isGoogleFont: Joi.boolean().default(false),
        fontSrc: Joi.array().items(Joi.string()).default([]),
        src: Joi.string().allow(""),
    }),
}
 
const variableSchema = {
    body: Joi.object().keys({
        name: Joi.string().required().min(2),
        value: Joi.string().required(),
        type: Joi.string().required(),

    }),
}

const iconSchema = {
    body:  Joi.object().keys({
        name: Joi.string().required().min(2),
        svg: Joi.string().allow(""),
        classes: Joi.string().allow(""),
    }).or('svg', 'classes'),
}

const styleSchema = {
    body: Joi.object().keys({
        styles: Joi.object(),
    }),
}

const animationSchema = {
    body: Joi.object().keys({
        styles: Joi.object(),
    }),
}



const codeSchema = {
    body: Joi.object().keys({
        code: Joi.string().required().allow(""),
    }),
}

module.exports = {
    colorSchema,
    fontSchema,
    variableSchema,
    animationSchema,
    iconSchema,
    codeSchema,
    styleSchema
}
