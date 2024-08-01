const { Page, Component, Collection, Form } = require('../models');
const he = require('he');
const { generateElementsCss } = require('../../utils/utils');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')


const { getStateValue } = require('../../utils/element-value');
const documentService = require('./document.service');



const getValue = (elem, value = '', states, props) => {
    const type = elem.type;
    const key = elem.key;

    switch (type) {
        case 'STATES':
            return getStateValue(key, states);
        case 'PROPS':
            return getStateValue(key, props);
        default:
            return value;
    }

}


/**
 * Create a page
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const createPage = async (pageBody) => {

    if (pageBody.setting)
        pageBody.setting.content = he.decode(pageBody.setting.content || '')


    if (pageBody.scripts) {
        pageBody.scripts.head = he.decode(pageBody.scripts.head || '')
        pageBody.scripts.footer = he.decode(pageBody.scripts.footer || '')
    }

    return Page.create(pageBody);
};

/**
 * Update a page
 * @param {String} id
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const updatePage = async (id, pageBody) => {

    const page = await Page.findOne({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }

    if (pageBody.setting)
        pageBody.setting.content = he.decode(pageBody.setting.content || '')

    if (pageBody.scripts) {
        pageBody.scripts.head = he.decode(pageBody.scripts.head || '')
        pageBody.scripts.footer = he.decode(pageBody.scripts.footer || '')
    }

    Object.assign(page, pageBody);
    await page.save();
    return page;
};


/**
 * Update a page Elements
 * @param {String} id
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const updateElements = async (id, pageBody) => {

    const page = await Page.findOne({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }

    page.published = false;
    Object.assign(page, pageBody);
    await page.save();
    return page;
};

/**
 * Publish a page
 * @param {String} id
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const publishPage = async (id, pageBody) => {

    const page = await Page.findOne({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found.');
    }

    const { updater } = pageBody;

    if (page.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page is already published.');
    }

    page.elements = page._elements;
    page.components = page._components;
    page.forms = page._forms;
    page.styles = page._styles;

    page.published = true;

    page.updater = updater

    Object.assign(page, pageBody);
    await page.save();
    return page;
};


/**
 * Restore a page
 * @param {String} id
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const restorePage = async (id, pageBody) => {

    const page = await Page.findOne({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found.');
    }

    const { updater } = pageBody;

    if (page.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'There are no new draft changes to restore.');
    }


    page._elements = page.elements;
    page._components = page.components;
    page._forms = page.forms;
    page._styles = page.styles;

    page.updater = updater

    Object.assign(page, pageBody);
    await page.save();
    return page;
};


/**
 * Update a page Style
 * @param {String} id
 * @param {Object} pageBody
 * @returns {Promise<Page>}
 */
const updateStyle = async (id, pageBody) => {

    const page = await Page.findOne({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }
    Object.assign(page, pageBody);
    await page.save();
    return page;
};

/**
 * Get Pages
 * @returns {Promise<Page[]>}
 */
const getPages = async (filter, options) => {

    const projection = {
        name: 1,
        slug: 1,
        'setting.status': 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        updater: 1,
        _id: 1,
    };



    const pages = await Page.paginate(filter, options, projection);
    return pages;
};

/**
 * Get a page
 * @param {String} id
 * @returns {Promise<Page>}
 */
const getPage = async (id) => {

    const collections = [
        {
            collectionName: 'ac_layouts',
            localField: 'layout',
            foreignField: '_id',
            as: 'populatedLayout',
            projection: {
                name: 1,
                _id: 1,
            }
        },
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'populatedImage',
            projection: { src: 1, _id: 1, alt: 1 }

        },
    ];

    const projection = {
        name: 1,
        slug: 1,
        setting: 1,
        layout: 1,
        scripts: 1,
        _id: 1,
    };


    const page = await Page.document(id, collections, projection);
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }
    return page;
};




/**
 * Get a page Style
 * @param {String} id
 * @returns {Promise<Page>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        _styles: 1,
        styles: 1,
        _id: 1,
        published: 1,

    };


    const page = await Page.findById(id).select(projection);
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }

    const doc = {
        _id: page._id
    }
    if (!page.published) {
        doc.styles = page._styles;
    } else
        doc.styles = page.styles;


    if (Object.keys(doc.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: doc.styles, _id: doc._id }) + '\n';
        stream.push(chunkStr);
    }

    stream.push(null);


};



/**
 * Duplicate Page
 * @returns {Promise<Page>}
 */
const duplicatePage = async (id) => {

    const page = await Page.duplicate(id);
    return page;
};


/**
 * Delete a page
 * @param {String} id
 * @returns {Promise<id>}
 */
const deletePage = async (id) => {
    const page = await Page.findOneAndDelete({ _id: id })
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
    }
    return { status: true };
};

module.exports = {
    getPages,
    getPage,
    getStyle,
    deletePage,
    duplicatePage,
    updatePage,
    updateElements,
    updateStyle,
    createPage,
    restorePage,
    publishPage
}