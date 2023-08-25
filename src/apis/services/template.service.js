const { Template } = require('../models');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')


/**
 * Create a template
 * @param {Object} templateBody
 * @returns {Promise<Template>}
 */
const createTemplate = async (templateBody) => {

    const { name } = templateBody;

    const template = await Template.findOne({ name })
    if (!template) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Template.create(templateBody);
};

/**
 * Update a template
 * @param {String} id
 * @param {Object} templateBody
 * @returns {Promise<Template>}
 */
const updateTemplate = async (id, templateBody) => {

    const template = await Template.findOne({ _id: id })
    if (!template) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
    }
    Object.assign(template, templateBody);
    await template.save();
    return template;
};

/**
 * Get Templates
 * @returns {Promise<Templates>}
 */
const getTemplates = async () => {
    return Template.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a template
 * @param {String} id
 * @returns {Promise<Template>}
 */
const getTemplate = async (id) => {
    const template = await Template.findOne({ _id: id })
    if (!template) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
    }
    return template;
};


/**
 * Delete a template
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteTemplate = async (id) => {
    const template = await Template.deleteOne({ _id: id })
    if (!template) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
    }
    return id;
};

module.exports = {
    getTemplates,
    getTemplate,
    deleteTemplate,
    updateTemplate,
    createTemplate
}