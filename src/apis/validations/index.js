
const Joi = require('joi');

const sharedObject= {
  creator: Joi.object().allow(null),
};


const sharedSchema = {
    body: Joi.object().keys(sharedObject)
}

module.exports.sharedValidation = sharedSchema;
module.exports.authValidation = require('./auth.validation')
module.exports.settingValidation = require('./setting.validation')
module.exports.themeValidation = require('./theme.validation')
module.exports.ecommerceValidation = require('./ecommerce.validation')
module.exports.formValidation = require('./form.validation')
module.exports.layoutValidation = require('./layout.validation')
module.exports.templateValidation = require('./template.validation')
module.exports.componentValidation = require('./component.validation')
module.exports.documentValidation = require('./document.validation')
module.exports.collectionValidation = require('./collection.validation')
module.exports.themesValidation = require('./themes.validation')
module.exports.backupValidation = require('./backup.validation')

module.exports.mediaValidation = require('./media.validation')
module.exports.pageValidation = require('./page.validation')
