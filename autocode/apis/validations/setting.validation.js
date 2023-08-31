const Joi = require('joi')


const imageSchema = Joi.object({
    _id: Joi.string(),
    src: Joi.string(),
    alt: Joi.string(),
    mimetype: Joi.string(),
    name: Joi.string()
})

const pageSchema = Joi.object({
    _id: Joi.string(),
    name: Joi.string(),
})

const settingSchema = {
    body: Joi.object().keys({
        webtitle: Joi.string().min(3),
        tagLine: Joi.string().allow(""),
        desc: Joi.string().allow(""),
        timeZone: Joi.string().allow(""),
        _id: Joi.string(),
        lang: Joi.string().allow(""),
        author: Joi.string().allow(""),
        keywords: Joi.string().allow(""),
        homePage: pageSchema,
        searchPage: pageSchema,
        maintenancePage: pageSchema,
        errorPage: pageSchema,
        email: Joi.object({
            host: Joi.string(),
            port: Joi.string(),
            ignoreTLS: Joi.boolean(),
            secure: Joi.boolean(),
            auth: Joi.object({
                user: Joi.string(),
                pass: Joi.string()
            }),
            subject: Joi.string(),
            from: Joi.string().email(),
            to: Joi.string().email(),
            cc: Joi.string().email(),
            bcc: Joi.string().email(),
            replyTo: Joi.string().email()
        }),
        images: Joi.object({
            favicon: imageSchema,
            logo: imageSchema,
            mobileLogo: imageSchema,
            placeholder: imageSchema
        }),
        scripts: Joi.object({
            head: Joi.string().allow(''),
            footer: Joi.string().allow('')
        }),

    }),
}



module.exports = {
    settingSchema
}
