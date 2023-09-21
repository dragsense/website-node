const { Component, Form, Collection } = require('../models');
const { generateElementsCss } = require('../../utils/utils');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')
const fs = require('fs');

const path = require('path');

const componentsDir = path.resolve(__dirname, '../..', 'components');




async function getFolderNames(rootDir) {
    const folders = fs.readdirSync(rootDir);
    const folderNames = [];

    for (const folder of folders) {
        const folderPath = path.join(rootDir, folder);
        const stats = fs.statSync(folderPath);

        if (stats.isDirectory()) {
            folderNames.push(folder);
        }
    }

    return folderNames;
}


/**
 * Create a component
 * @param {Object} componentBody
 * @returns {Promise<Component>}
 */
const createComponent = async (componentBody) => {
    return Component.create(componentBody);
};

/**
 * Update a component
 * @param {String} id
 * @param {Object} componentBody
 * @returns {Promise<Component>}
 */
const updateComponent = async (id, componentBody) => {

    const component = await Component.findOne({ _id: id })
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }

    if (componentBody.states) {
        component._states = componentBody.states;
    }


    Object.assign(component, componentBody);
    await component.save();
    return component;
};

/**
 * Update a component
 * @param {String} id
 * @param {Object} componentBody
 * @returns {Promise<Collection>}
 */
const updateElements = async (id, componentBody) => {

    const component = await Component.findOne({ _id: id })
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }

    component.published = false;
    Object.assign(component, componentBody);
    await component.save();
    return component;
};


/**
 * Publish a component
 * @param {String} id
 * @param {Object} componentBody
 * @returns {Promise<Component>}
 */
const publishComponent = async (id, componentBody) => {

    const component = await Component.findOne({ _id: id })
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found.');
    }

    const { updater } = componentBody;

    if (component.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component is already published.');
    }

    component.elements = component._elements;
    component.components = component._components;
    component.forms = component._forms;
    component.styles = component._styles;
    component.states = component._states;
    component.collStates = component._collStates;

    component.published = true;

    component.updater = updater

    Object.assign(component, componentBody);
    await component.save();
    return component;
};

/**
 * Get Custom Paths
 * @returns {Promise<Paths>}
 */
const getPaths = async () => {

    let entries = [];

    entries = await getFolderNames(componentsDir + "/Custom");

    return entries;
};


/**
 * Get Components
 * @returns {Promise<Component[]>}
 */
const getComponents = async (filter, options) => {

    const projection = {
        name: 1,
        slug: 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        updater: 1,
        _id: 1,
    };



    const components = await Component.paginate(filter, options, projection);
    return components;
};


/**
 * Duplicate Component
 * @returns {Promise<Component>}
 */
const duplicateComponent = async (id) => {

    const component = await Component.duplicate(id);
    return component;
};

/**
 * Get a component
 * @param {String} id
 * @returns {Promise<Component>}
 */
const getComponent = async (id) => {


    const collections = [

        {
            collectionName: 'ac_components',
            localField: 'parent',
            foreignField: '_id',
            as: 'component',
            projection: { name: 1, _id: 1 }
        },
        {
            collectionName: 'ac_collections',
            localField: 'attached',
            foreignField: '_id',
            as: 'collection',
            projection: { name: 1, _id: 1 }
        },

    ];

    const projection = { name: 1, _id: 1, parent: 1, attached: 1, states: 1 };

    const component = await Component.document(id, collections, projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }
    return component;
};


/**
 * Get a component Style
 * @param {String} id
 * @returns {Promise<Component>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        styles: 1,
        _id: 1,
        published: 1,
        _styles: 1,
       
    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }

    const doc = {
        _id: component._id
    }
    if (!component.published) {
        doc.styles = component._styles;
    } else
        doc.styles = component.styles;

    if (Object.keys(doc.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: doc.styles, _id: doc._id }) + '\n';
        stream.push(chunkStr);
    }
    stream.push(null);


};


/**
 * Delete a component
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteComponent = async (id) => {
    const component = await Component.findOneAndDelete({ _id: id })
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }
    return id;
};

module.exports = {
    getComponents,
    getComponent,
    duplicateComponent,
    deleteComponent,
    updateComponent,
    updateComponent,
    createComponent,
    updateElements,
    getStyle,
    getPaths,
    publishComponent
}