const Joi = require('joi');

const { validateMultipleEmails } = require('./customize.validation')


const formObject = {
  name: Joi.string().required(),
  slug: Joi.string().required(),
  type: Joi.string().default('form'),
  record: Joi.boolean().default(false),
  recordOnly: Joi.boolean().default(false),
  emailbody: Joi.object({
    plain: Joi.when('html', {
      is: false,
      then: Joi.string().required(),
      otherwise: Joi.string().allow(''),
    }),
    head: Joi.string().allow(''),
    body: Joi.when('html', {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string().allow(''),
    }).default(""),
    footer: Joi.string().allow(''),
    html: Joi.boolean().default(false),
  }).when('recordOnly', {
    is: true,
    then: Joi.object().strip(),
    otherwise: Joi.object().default({ plain: "", html: false }),
  }),
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
  setting: Joi.object({
    to: Joi.string().required().custom(validateMultipleEmails),
    from: Joi.string().email().required(),
    subject: Joi.string().default('Untitled Email'),
    cc: Joi.string().custom(validateMultipleEmails).allow(''),
    bcc: Joi.string().custom(validateMultipleEmails).allow(''),
    replyTo: Joi.string().email().allow(''),
    redirect: Joi.string().pattern(/^(https?:\/\/).+$/i).allow(''), // Custom regex pattern for URL with optional http/https
    successMessage: Joi.string().allow(''),
    errorMessage: Joi.string().allow(''),
    sendCopy: Joi.boolean().default(false),
  }).when('recordOnly', {
    is: true,
    then: Joi.object().strip(),
    otherwise: Joi.object().required(),
  }),
  updater: Joi.object().allow(null),
  creator: Joi.object().allow(null),
};


const formSchema = {
  body: Joi.object().keys(formObject)
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
  formSchema,
  elementsSchema,
  styleSchema

};

