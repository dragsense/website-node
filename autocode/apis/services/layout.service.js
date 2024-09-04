const { Layout, Component } = require('../models')

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')

/**
 * Create a layout
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const createLayout = async (layoutBody, withTemplate) => {
    const { name } = layoutBody

    const layout = await Layout.findOne({ name })
    if (layout) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken')
    }
    layoutBody.withTemplate = withTemplate

    return Layout.create(layoutBody)
}

/**
 * Update a layout
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const updateLayout = async (id, layoutBody) => {
    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found')
    }
    Object.assign(layout, layoutBody)
    await layout.save()

    return layout
}

/**
 * Update a layout Elements
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const updateElements = async (id, layoutBody) => {

    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }

    layout.published = false;
    Object.assign(layout, layoutBody);
    await layout.save();
    return layout;
};

/**
 * Publish a layout
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const publishLayout = async (id, layoutBody) => {

    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found.');
    }

    const { updater } = layoutBody;

    if (layout.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout is already published.');
    }

    layout.elements = layout._elements;
    layout.components = layout._components;
    layout.forms = layout._forms;
    layout.styles = layout._styles;

    layout.published = true;

    layout.updater = updater

    Object.assign(layout, layoutBody);
    await layout.save();
    return layout;
};


/**
 * Restore a layout
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const restoreLayout = async (id, layoutBody) => {

    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found.');
    }

    const { updater } = layoutBody;

    if (layout.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'There are no new draft changes to restore.');
    }


    layout._elements = layout.elements;
    layout._components = layout.components;
    layout._forms = layout.forms;
    layout._styles = layout.styles;

    layout.updater = updater;
    layout.published = true;


    Object.assign(layout, layoutBody);
    await layout.save();
    return layout;
};


/**
 * Update a layout Style
 * @param {String} id
 * @param {Object} layoutBody
 * @returns {Promise<Layout>}
 */
const updateStyle = async (id, layoutBody) => {

    const layout = await Layout.findOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }
    Object.assign(layout, layoutBody);
    await layout.save();
    return layout;
};


/**
 * Get a layout Style
 * @param {String} id
 * @returns {Promise<Layout>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        _styles: 1,
        styles: 1,
        _id: 1,
        published: 1,

    };


    const layout = await Layout.findById(id).select(projection);
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found');
    }

    const doc = {
        _id: layout._id
    }
    if (!layout.published) {
        doc.styles = layout._styles;
    } else
        doc.styles = layout.styles;


    if (Object.keys(doc.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: doc.styles, _id: doc._id }) + '\n';
        stream.push(chunkStr);
    }

    stream.push(null);


};



/**
 * Duplicate Layout
 * @returns {Promise<Layout>}
 */
const duplicateLayout = async (id) => {

    const layout = await Layout.duplicate(id);
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
        _id: 1,
    }

    const layouts = await Layout.paginate(filter, options, projection)
    return layouts
}

/**
 * Get a layout
 * @param {String} id
 * @returns {Promise<Layout>}
 */
const getLayout = async (id) => {
    const layout = await Layout.findOne({ _id: id }).select('name _id')
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found')
    }


    return { ...layout.toObject() }
}

/**
 * Delete a layout
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteLayout = async (id) => {
    const layout = await Layout.deleteOne({ _id: id })
    if (!layout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Layout not found')
    }
    return id
}

module.exports = {
    getLayouts,
    getLayout,
    deleteLayout,
    getStyle,
    duplicateLayout,
    updateLayout,
    updateElements,
    updateStyle,
    createLayout,
    restoreLayout,
    publishLayout
}
