const { Component, Form, Collection } = require('../models');
const {  generateElementsCss } = require('../../utils/utils');

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
        collStates: 1,
        type: 1,
        attached: 1,
        _id: 1,
        name: 1,
        slug: 1,
        createdAt:1,
        url: 1,
        creator: 1,

    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }


    if (component.parent) {
        const parent = await Component.findById(component.parent).select({ states: 1 });
        component._doc.props = parent.states;
    }



    const chunkStr = JSON.stringify(component._doc) + '\n';
    stream.push(chunkStr);


    const laoded = {};

    const loadCollection = async (collection, projection = {
        states: 1,
        relationships: 1,
        setting: 1,
        name: 1,
        slug: 1,
        createdAt:1,
        url: 1,
        creator: 1,
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
                {
                    collectionName: 'ac_medias',
                    localField: 'setting.image',
                    foreignField: '_id',
                    as: 'populatedImage',
                    projection: { src: 1, _id: 1, alt: 1 }
        
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

                const chunkStr = JSON.stringify(form) + '\n';
                stream.push(chunkStr);

                laoded[form[i]] = true;

                const innerComponents = form.components || [];
                await loadComponents(innerComponents, projection)

                const forms = form.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component && !laoded[components[i]]) {
                laoded[components[i]] = true;

                const chunkStr = JSON.stringify(component._doc) + '\n';
                stream.push(chunkStr);

                const collection = component.attached;
                if(collection)
                await loadCollection(collection);

                const innerComponents = component.components || [];

                
                await loadComponents(innerComponents)

                const forms = component.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const components = component.components || [];
    const forms = component.forms || [];

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
        _id: 1
    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }

    if (Object.keys(component.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: component.styles, _id: component._id }) + '\n';
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
        _id: 1
    };


    const component = await Component.findById(id).select(projection);
    if (!component) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Component not found');
    }
    let css = [];

    const elements = component.elements || {};


    css = [generateElementsCss(elements, component._id)];



    const styles = component.styles || {};



    css = [...css, generateElementsCss(styles, component._id)];


    const loadFormsCSS = async (forms) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form) {
                const elements = form.elements || {};

                css = [...css, generateElementsCss(elements, form._id)];
                let styles = form.styles || {};
                css = [...css, generateElementsCss(styles, form._id)];

                const components = form.components || [];
                await loadComponentsCSS(components)
            }
        }
    }


    const loadComponentsCSS = async (components) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component) {
                const elements = component.elements || {};

                css = [...css, generateElementsCss(elements,component._id)];
                let styles = component.styles || {};
                css = [...css, generateElementsCss(styles, component._id)];

                const innerComponents = component.components || [];
                console.log(innerComponents)

                await loadComponentsCSS(innerComponents)
                const forms = component.forms || [];
                await loadFormsCSS(forms);
            }
        }
    }


    const components = component.components || [];
    await loadComponentsCSS(components);
    const forms = component.forms || [];
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
    createComponent,
    getCss,
    getElements,
    getStyle,
    getPaths
}