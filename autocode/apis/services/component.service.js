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
 * Get a component Elements
 * @param {String} id
 * @returns {Promise<Component>}
 */
const getElements = async (id, stream) => {


    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        parent: 1,
        events: 1,
        collStates: 1,

        _elements: 1,
        _components: 1,
        _forms: 1,
        _states: 1,
        _events: 1,

        _collStates: 1,
        published: 1,


        type: 1,
        attached: 1,
        _id: 1,
        name: 1,
        createdAt: 1,
        creator: 1,

    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }


    if (component.parent) {
        const parent = await Component.findById(component.parent).select({ _states: 1, states: 1, published: 1 });
        component._doc.props = parent.published ? parent.states : parent._states;
    }

    const doc = {
        type: component.type,
        attached: component.attached,
        parent: component.parent,
        createdAt: component.createdAt,
        creator: component.creator,
        props: component.props,
        _id: component._id
    }
    if (!component.published) {
        doc.elements = component._elements;
        doc.components = component._components;
        doc.forms = component._forms;
        doc.states = component._states;
        doc.events = component._events;
        doc.collStates = component._collStates;

    } else {
        doc.elements = component.elements;
        doc.components = component.components;
        doc.forms = component.forms;
        doc.states = component.states;
        doc.events = component.events;
        doc.collStates = component.collStates;

    }

    const chunkStr = JSON.stringify(doc) + '\n';
    stream.push(chunkStr);


    const laoded = {};

    const loadCollection = async (collection, projection = {
        states: 1,
        relationships: 1,
        setting: 1,
        name: 1,
        _id: 1
    }) => {
        if (collection && !laoded[collection]) {
            laoded[collection] = true

            const collections = [

                {
                    collectionName: 'ac_collections',
                    localField: 'relationships',
                    foreignField: '_id',

                    as: 'populatedRelationships',
                    projection: { name: 1, slug: 1, _id: 1, states: 1 }
                },

            ];


            const coll = await Collection.document(collection._id, collections, projection);
            if (coll) {
                const chunkStr = JSON.stringify(coll) + '\n';
                stream.push(chunkStr);
            }

        }
    }


    const collection = component.attached;
    await loadCollection(collection);




    
    const loadForms = async (forms, projection) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form && !laoded[forms[i]]) {
                laoded[form[i]] = true;

                const doc = {

                    type: form.type,
                    attached: form.attached,
                    createdAt: form.createdAt,
                    creator: form.creator,
                    setting: form.setting,
                    url: form.url,
                    _id: form._id
                }
                if (!form.published) {
                    doc.elements = form._elements;
                    doc.components = form._components;
                    doc.forms = form._forms;
                    doc.states = form._states;
                    doc.collStates = form._collStates;
                } else {
                    doc.elements = form.elements;
                    doc.components = form.components;
                    doc.forms = form.forms;
                    doc.states = form.states;
                    doc.collStates = form.collStates;
                }

                const chunkStr = JSON.stringify(doc) + '\n';
                stream.push(chunkStr);

                laoded[form[i]] = true;

                const innerComponents = doc.components || [];
                await loadComponents(innerComponents, projection)

                const forms = doc.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component && !laoded[components[i]]) {
                laoded[components[i]] = true;

                const doc = {
                    parent: component.parent,
                    type: component.type,
                    attached: component.attached,
                    createdAt: component.createdAt,
                    creator: component.creator,
                    setting: component.setting,
                    url: component.url,
                    _id: component._id
                }
                if (!component.published) {
                    doc.elements = component._elements;
                    doc.components = component._components;
                    doc.forms = component._forms;
                    doc.states = component._states;
                    doc.collStates = component._collStates;
                } else {
                    doc.elements = component.elements;
                    doc.components = component.components;
                    doc.forms = component.forms;
                    doc.states = component.states;
                    doc.collStates = component.collStates;
                }

                const chunkStr = JSON.stringify(doc) + '\n';
                stream.push(chunkStr);

                const collection = component.attached;
                if (collection)
                    await loadCollection(collection);

                const innerComponents = doc.components || [];


                await loadComponents(innerComponents)

                const forms = doc.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const components = doc.components || [];
    const forms = doc.forms || [];

    await loadComponents(components, projection);
    await loadForms(forms, projection)




    stream.push(null);

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
 * Get a component Css
 * @param {String} id
 * @returns {Promise<CSS>}
 */
const getCss = async (id) => {


    const projection = {
        styles: 1,
        elements: 1,
        components: 1,
        forms: 1,
        _id: 1,
        published: 1,
        _forms: 1,
        _components: 1,
        _styles: 1,
    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }
    let css = [];

    const doc = {
        _id: component._id
    }
    if (!component.published) {
        doc.components = component._components;
        doc.forms = component._forms;
        doc.styles = component._styles;

    } else {
        doc.styles = component.styles;
        doc.components = component.components;
        doc.forms = component.forms;

    }


    const styles = doc.styles || {};

    css = [...css, generateElementsCss(styles, doc._id)];


    const loadFormsCSS = async (forms) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form) {

                const doc = {
                    _id: form._id
                }
                if (!form.published) {
                    doc.components = form._components;
                    doc.styles = form._styles;

                } else {
                    doc.styles = form.styles;
                    doc.components = form.components;

                }

                let styles = doc.styles || {};
                css = [...css, generateElementsCss(styles, doc._id)];

                const components = doc.components || [];
                await loadComponentsCSS(components)
            }
        }
    }


    const loadComponentsCSS = async (components) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component) {

                const doc = {
                    _id: component._id
                }
                if (!component.published) {
                    doc.components = component._components;
                    doc.styles = component._styles;
                    doc.forms = component._forms;


                } else {
                    doc.styles = component.styles;
                    doc.components = component.components;
                    doc.forms = component.forms;

                }

                let styles = doc.styles || {};
                css = [...css, generateElementsCss(styles, doc._id)];

                const innerComponents = doc.components || [];

                await loadComponentsCSS(innerComponents)
                const forms = doc.forms || [];
                await loadFormsCSS(forms);
            }
        }
    }



    const components = doc.components || [];
    await loadComponentsCSS(components);
    const forms = doc.forms || [];
    await loadFormsCSS(forms);

    return { css }

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
    getCss,
    getElements,
    getStyle,
    getPaths,
    publishComponent
}