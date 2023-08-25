const { Collection, Form, Component, Document } = require('../models');
const he = require('he');
const { generateCss, generateElementsCss, updateContentWithType } = require('../../utils/utils');
const mongoose = require('mongoose');
const pluralize = require('pluralize');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')
import { getStateValue } from '../../utils/element-value';
import { documentService } from '.';


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
 * Create a collection
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const createCollection = async (collectionBody) => {


    if (collectionBody.setting)
        collectionBody.setting.content = he.decode(collectionBody.setting.content || '')

    if (collectionBody.scripts) {
        collectionBody.scripts.head = he.decode(collectionBody.scripts.head || '')
        collectionBody.scripts.footer = he.decode(collectionBody.scripts.footer || '')
    }

    if (collectionBody.states)
        updateContentWithType(collectionBody.states, 'content')



    return Collection.create(collectionBody);
};

/**
 * Update a collection
 * @param {String} id
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const updateCollection = async (id, collectionBody) => {

    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    if (collectionBody.setting)
        collectionBody.setting.content = he.decode(collectionBody.setting.content || '')

    if (collectionBody.scripts) {
        collectionBody.scripts.head = he.decode(collectionBody.scripts.head || '')
        collectionBody.scripts.footer = he.decode(collectionBody.scripts.footer || '')
    }

    if (collectionBody.states)
        updateContentWithType(collectionBody.states, 'content')


    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};


/**
 * Update a collection
 * @param {String} id
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const updateElements = async (id, collectionBody) => {

    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};

/**
 * Update a collection Style
 * @param {String} id
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const updateStyle = async (id, collectionBody) => {

    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};

/**
 * Get Collections
 * @returns {Promise<Collection[]>}
 */
const getCollections = async (filter, options) => {

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


    const collections = await Collection.paginate(filter, options, projection);
    return collections;

};

/**
 * Get a collection
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getCollection = async (id) => {

    const collections = [

        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, slug: 1, _id: 1 }
        },
        {
            collectionName: 'ac_layouts',
            localField: 'layout',
            foreignField: '_id',
            as: 'populatedLayout',
            projection: { name: 1, _id: 1 }

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
        scripts: 1,
        slug: 1,
        type: 1, _id: 1, layout: 1,
        setting: 1, relationships: 1, states: 1
    };




    const collection = await Collection.document(id, collections, projection);
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }
    return collection;


};



/**
 * Get a collection data
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getPageData = async (id, withCss = false) => {



    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        parent: 1,
        collStates: 1,
        type: 1,
        layout: 1,
        setting: 1,
        attached: 1,
        _id: 1
    };


    const page = await Collection.findById(id).select(projection).populate('layout', 'components');;

    const pages = {}

    let css = [];
    if (!page) {
        return { pages, layout: {}, states: {}, css };
    }


    if (withCss) {
        const styles = page.styles || {};
        css = [...css, generateElementsCss(styles, page._id)];
    }


    pages[page._id] = { elements: page.elements || {} }

    const components = page.components || [];


    const getFilters = (filters, states, props) => {

        let _filters = [];

        if (!filters)
            return _filters;

        _filters = Object.values(filters).map(filter => {
            const type = filter.triggerType;
            const key = filter.triggerKey;
            const value = filter.defaultValue;

            let defaultValue = getValue({ type, key }, value, states, props);
            return { filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        }
        )

        return _filters;

    }

    const laodDocumnents = async (collection, _states, _props) => {


        let _id = collection._id;

        if (!_id)
            return collection;

        const docs = collection.docs || [];
        const states = collection.states || {};
        const setting = collection.setting || {};
        const withRelationship = collection.withRelationship || false;
        const selectedRelationships = collection.selectedRelationships || [];


        let documents = [];
        let maxPage = collection.maxPage || 0;

        if (Array.isArray(docs) && docs?.length > 0) {

            const docIds = docs.map(doc => doc._id);


            const res = await documentService.getFilteredDocuments(_id, { documentIds: docIds, withRelationship, selectedRelationships })


            documents = Array.isArray(res.documents) ? res.documents : [];
            maxPage = res.total;

        }
        else {
            const filters = collection.filters || null;
            let sortBy = collection.sortBy || 'createdAt';
            let sort = collection.sort || 'acs';
            let limit = collection.limit || 10;
            let page = collection.page || 1;

            const computedFilters = getFilters(filters, _states, _props);

            const res = await documentService.getAllFilteredDocuments(_id,
                { filters: computedFilters, withRelationship, selectedRelationships },
                {},
                { page, limit, sortBy: sortBy + ":" + sort }
            )

            documents = Array.isArray(res.documents) ? res.documents : [];
            maxPage = res.total;
        }

        return { ...collection, documents, states, setting, maxPage }

    }

    const loadCollection = async (collection, projection = {
        states: 1,
        relationships: 1,
        setting: 1,
        name: 1,
        _id: 1
    }) => {
        if (collection) {


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
                pages[coll._id] = { elements: coll.elements || {}, states: coll.states || {}, setting: coll.setting || {} }
            }

        }
    }

    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);

            if (component && !pages[components[i]]) {

                pages[component._id] = {
                    elements: component.elements || {},
                    states: component.states || {},
                }

                if (withCss) {
                  
                    let styles = component.styles || {};
                    css = [...css, generateElementsCss(styles, component._id)];
                }

                const collection = component.attached;

                if (collection && !pages[collection?.toString()]) {
                    let parent = {};

                    if (component.parent) {
                        const parentId = component.parent.toString();


                        if (!pages[parentId]) {
                            pages[parentId] = await Component.findById(parentId).select(projection);
                            parent = pages[parentId];
                        } else
                            parent = pages[parentId];
                    }



                    await loadCollection(collection);
                    if (pages[collection]) {
                        let collStates = {
                            ...component.collStates,
                            _id: collection,
                            setting: pages[collection].setting,
                            states: pages[collection].states
                        }
                        collStates = await laodDocumnents(collStates, component.states, parent?.states || {})
                        pages[component._id].collStates = collStates;

                    }
                }

                const innerComponents = component.components || [];
                await loadComponents(innerComponents, projection)

                const forms = component.forms || [];
                await loadForms(forms, projection)
            }
        }
    }


    const forms = page.forms || [];

    const loadForms = async (forms, projection) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form && !pages[form[i]]) {

                pages[form._id] = {
                    elements: form.elements || {},
                    states: form.states || {},
                }

                if (withCss) {

              
                    const styles = form.styles || {};
                    css = [...css, generateElementsCss(styles, form._id)];
                }

                const innerComponents = form.components || [];

                await loadComponents(innerComponents, projection)

                const forms = form.forms || [];
                await loadComponents(forms, projection)

            }
        }
    }

    await loadForms(forms, projection)
    await loadComponents(components, projection);


    const layout = page.layout?.components;
    const LayoutComponents = [];

    if (layout) {
        if (layout.top) {
            LayoutComponents[0] = (layout.top.toString())
        }
        if (layout.bottom) {
            LayoutComponents[1] = (layout.bottom.toString())
        }
        await loadComponents(LayoutComponents, projection)

    }



    return {
        css,
        pages, layout: { top: LayoutComponents[0], bottom: LayoutComponents[1] },
        states: page.states || {}

    };


};


/**
 * Get a collection Elements
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getElements = async (id, stream) => {


    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        _id: 1
    };


    const collection = await Collection.findById(id).select(projection);
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }


    const chunkStr = JSON.stringify(collection._doc) + '\n';
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

    const components = collection.components || [];
    const forms = collection.forms || [];

    await loadComponents(components, projection);
    await loadForms(forms, projection)
  

    stream.push(null);

};



/**
 * Get a collection Style
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        styles: 1,
        _id: 1
    };


    const collection = await Collection.findById(id).select(projection);
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    if (Object.keys(collection.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: collection.styles, _id: collection._id }) + '\n';
        stream.push(chunkStr);
    }

    stream.push(null);


};


/**
 * Get a collection Css
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

    let css = [];

    const page = await Collection.findById(id).select(projection);
    if (!page) {
        return { css };
    }

    const elements = page.elements || {};

    css = [generateElementsCss(elements, page._id)];



    const styles = page.styles || {};



    css = [...css, generateElementsCss(styles, page._id)];


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

                css = [...css, generateElementsCss(elements, component._id)];
                let styles = component.styles || {};
                css = [...css, generateElementsCss(styles, component._id)];

                const innerComponents = component.components || [];

                await loadComponentsCSS(innerComponents)
                const forms = component.forms || [];
                await loadFormsCSS(forms);
            }
        }
    }


    const components = page.components || [];
    await loadComponentsCSS(components);
    const forms = page.forms || [];
    await loadFormsCSS(forms);

    return { css }

};


/**
 * Duplicate Collection
 * @returns {Promise<Collection>}
 */
const duplicateCollection = async (id) => {

    const collection = await Collection.duplicate(id);
    return collection;
};


/**
 * Delete a collection
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteCollection = async (id) => {
    try {
        const collection = await Collection.findOneAndDelete({ _id: id });

        if (!collection) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
        }

        const modelName = collection.slug;

        const res = await mongoose.connection.db.dropCollection(pluralize(modelName.toLowerCase()));

        if (!res) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Documents not found');
        }

        return id;
    } catch (error) {
        // Handle errors here
        if (error instanceof ApiError) {
            throw error; // Re-throw custom API error
        } else if (error.name === 'MongoError' && error.code === 26) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
        } else if (error.name === 'MongoError' && error.code === 26) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Documents not found');
        } else {
            console.error('An unexpected error occurred:', error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
        }
    }
};

module.exports = {
    getCollections,
    getCollection,
    duplicateCollection,
    deleteCollection,
    updateCollection,
    createCollection,
    updateElements,
    updateStyle,
    getCss,
    getElements,
    getPageData,
    getStyle,
}