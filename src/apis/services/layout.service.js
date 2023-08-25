const { Layout, Component } = require('../models');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')


/**
 * Create a layout
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const createLayout = async (layoutBody) => {

    const { name } = layoutBody;

    const layout = await Layout.findOne({ name });
    if (layout) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Layout.create(layoutBody);
};

/**
 * Update a layout
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const updateLayout = async (id, layoutBody) => {

    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }
    Object.assign(layout, layoutBody);
    await layout.save();
    
    return layout;
};

/**
 * Get Layouts
 * @returns {Promise<Layout[]>}
 */
const getLayouts = async (filter, options) => {

    const projection = {
        name: 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        updator: 1,
        topComponent: 1,
        bottomComponent: 1,
        _id: 1,
    };


    const layouts = await Layout.paginate(filter, options, projection);
    return layouts;

};

/**
 * Get a layout
 * @param {String} id
 * @returns {Promise<Layout>}
 */
const getLayout = async (id) => {
    const layout = await Layout.findOne({ _id: id }).select('name _id topComponent bottomComponent components')
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }

    const populatedComponents = [
        await Component.findById(layout.components.top).select('name _id'),
        await Component.findById(layout.components.bottom).select('name _id'),
    ];
  

    return {...layout.toObject(), populatedComponents};
};


/**
 * Delete a layout
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteLayout = async (id) => {
    const layout = await Layout.deleteOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }
    return id;
};

module.exports = {
    getLayouts,
    getLayout,
    deleteLayout,
    updateLayout,
    createLayout
}