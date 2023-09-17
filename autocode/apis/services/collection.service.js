// Importing required modules and dependencies
const { Collection, Form, Component, Document } = require('../models');
const he = require('he');
const { ObjectId } = require('mongodb');

const { generateCss, generateElementsCss, updateContentWithType } = require('../../utils/utils');
const mongoose = require('mongoose');
const pluralize = require('pluralize');
const httpStatus = require('http-status');
const ApiError = require('../../utils/api-error');
const { getStateValue } = require('../../utils/element-value');
const documentService = require('./document.service');

// Function to get value based on the type
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

// Function to create a new collection
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

// Function to update a collection
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

// Function to update elements in a collection
const updateElements = async (id, collectionBody) => {
    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    collection.published = false;
    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};

// Function to publish a collection
const publishCollection = async (id, collectionBody) => {
    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found.');
    }

    const { updater } = collectionBody;

    if (collection.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection is already published.');
    }

    collection.elements = collection._elements;
    collection.components = collection._components;
    collection.forms = collection._forms;
    collection.styles = collection._styles;
    collection.states = collection._states;

    collection.published = true;

    collection.updater = updater

    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};

// Function to update style of a collection
const updateStyle = async (id, collectionBody) => {
    // Find the collection by id
    const collection = await Collection.findOne({ _id: id })
    // If collection does not exist, throw an error
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    // Merge the collectionBody into the collection
    Object.assign(collection, collectionBody);
    // Save the updated collection
    await collection.save();
    // Return the updated collection
    return collection;
};

/**
 * Get Collections
 * @returns {Promise<Collection[]>}
 */
const getCollections = async (filter, options) => {

    // Define the fields to be returned
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

    // Fetch the collections based on the filter, options and projection
    const collections = await Collection.paginate(filter, options, projection);
    // Return the fetched collections
    return collections;

};

/**
 * Get a collection
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getCollection = async (id) => {

    // Define the collections to be populated
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

    // Define the fields to be returned
    const projection = {
        name: 1,
        scripts: 1,
        slug: 1,
        type: 1, _id: 1, layout: 1,
        setting: 1, relationships: 1, states: 1, populatedRelationships: 1
    };

    // Fetch the collection by id, populate the defined collections and return the defined fields
    const collection = await Collection.document(id, collections, projection);
    // If collection does not exist, throw an error
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }
    // Return the fetched collection
    return collection;


};



/**
 * Get a collection data
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getPageData = async (id, withCss = false, document) => {



    // Define the fields to be returned
    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        relationships: 1,
        styles: 1,

        collStates: 1,
        events: 1,
        published: 1,


        attached: 1,
        type: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        url: 1,
        slug: 1,
        name: 1,
        _id: 1
    };


    const collections = [

        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, slug: 1, _id: 1, }
        },

        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'setting.populatedImage',
            projection: { src: 1, alt: 1 }

        },
    ];

    const page = await Collection.document(id, collections, projection);

    // Initialize the pages object
    const pages = {}

    // Initialize the css array
    let css = [];
    // If page does not exist, return the pages object, layout object, states object and css array
    if (!page) {
        return { pages, layout: {}, states: {}, css };
    }


    // If withCss is true, generate the css for the page styles and add it to the css array
    if (withCss) {
        const styles = page.styles || {};
        css = [...css, generateElementsCss(styles, page._id)];
    }

    const settingData = {};

    const relationships = page.populatedRelationships.reduce((result, rel) => {
        result[rel._id] = rel.name;
        return result;
    }, {});

    if (document) {

        const relationships = [

            ...(page.populatedRelationships.map(rel => {
                const modelName = rel.slug.toLowerCase();
                return {
                    collectionName: modelName,
                    localField: `relationships.${rel._id}`,
                    foreignField: '_id',

                    as: `populatedRelationships.${rel._id}`,
                    projection: { name: 1, _id: 1 }
                }
            })),
            {
                collectionName: 'ac_medias',
                localField: 'setting.image',
                foreignField: '_id',
                as: 'setting.populatedImage',
                projection: { src: 1, alt: 1 }

            },
        ];



        const modelName = page.slug;
        const DocumentModel = Document(modelName)
        document = await DocumentModel.document(document._id, relationships, projection);

        if (document) {
            const proj = {
                name: 1,
                url: 1,
                slug: 1,
                setting: 1,
            };
            const nextDoc = await DocumentModel.
                findOne({ _id: { $gt: new ObjectId(document._id) }, 'setting.status': 'PUBLIC' }).sort({ _id: -1 })
                .select(proj).populate({
                    path: 'setting.image',
                    select: 'src alt'
                }).exec();
            const prevDoc = await DocumentModel.
                findOne({ _id: { $lt: new ObjectId(document._id) }, 'setting.status': 'PUBLIC' })
                .sort({ _id: 1 })
                .select(proj).populate({
                    path: 'setting.image',
                    select: 'src alt'
                }).exec();

            if (nextDoc)
                settingData.NEXTDOCUMNET = {
                    _id: nextDoc._id,
                    slug: nextDoc.slug,
                    name: nextDoc.name,
                    title: nextDoc.setting?.title,
                    image: nextDoc.setting?.image,
                    url: nextDoc.url,
                };

            if (prevDoc) {
                settingData.PREVDOCUMNET = {
                    _id: prevDoc._id,
                    slug: prevDoc.slug,
                    name: prevDoc.name,
                    title: prevDoc.setting?.title,
                    image: prevDoc.setting?.image,
                    url: prevDoc.url,
                };
            }
        }


    }
    // Add the page elements to the pages object
    pages[page._id] = {
        elements: page.elements || {},

        pageSetting: {
            _id: page._id,
            setting: document?.setting || page.setting,
            states: document?.states || page.states,
            name: document?.name || page.name,
            slug: document?.slug || page.slug,
            relationships: relationships,
            populatedRelationships: document.populatedRelationships,
            creator: document?.creator || page.creator,
            createdAt: document?.createdAt || page.createdAt,
            url: document?.url || page.url,
            ...settingData
        }

    }

    // Get the components of the page
    const components = page.components || [];


    // Function to get filters
    const getFilters = (filters, states, props) => {

        // Initialize the _filters array
        let _filters = [];

        // If filters does not exist, return the _filters array
        if (!filters)
            return _filters;

        // Map through filters and return an array of filter objects
        _filters = Object.values(filters).map(filter => {
            const type = filter.triggerType;
            const key = filter.triggerKey;
            const value = filter.defaultValue;

            // Get the default value based on the type and key
            let defaultValue = getValue({ type, key }, value, states, props);
            return { filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        })

        return _filters;

    }

    // Function to load documents based on the collection, states, and props
    const laodDocumnents = async (collection, _states, _props) => {

        let _id = collection._id;

        // If no id is provided, return the collection as is
        if (!_id)
            return collection;

        const docs = collection.docs || [];
        const states = collection.states || {};
        const setting = collection.setting || {};
        const withRelationship = collection.withRelationship || false;
        const selectedRelationships = collection.selectedRelationships || [];

        let documents = [];
        let maxPage = collection.maxPage || 0;

        // If docs is an array and has length greater than 0, get the document ids and fetch the documents
        if (Array.isArray(docs) && docs?.length > 0) {

            const docIds = docs.map(doc => doc._id);

            const res = await documentService.getFilteredDocuments(_id, { documentIds: docIds, withRelationship, selectedRelationships })

            documents = Array.isArray(res.documents) ? res.documents : [];
            maxPage = res.total;

        }
        // If docs is not an array or has length 0, get the filters and fetch all documents
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

        // Return the collection with the fetched documents, states, setting, and maxPage
        return { ...collection, documents, states, setting, maxPage }

    }

    // Function to load a collection based on the collection and projection
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
                    projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 }
                },

            ];

            // Fetch the collection document and add it to the pages object
            const coll = await Collection.document(collection._id, collections, projection);
            if (coll) {
                pages[coll._id] = {
                    createdAt: coll.createdAt,
                    url: coll.url,
                    name: coll.name,

                    slug: coll.slug,

                    elements: coll.elements || {},
                    states: coll.states || {},
                    setting: coll.setting || {}
                }
            }

        }
    }

    // Function to load components based on the components and projection
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

                let parent = {};

                if (component.parent) {
                    const parentId = component.parent.toString();

                    if (!pages[parentId]) {
                        pages[parentId] = await Component.findById(parentId).select(projection);
                        parent = pages[parentId];
                    } else
                        parent = pages[parentId];
                }

                const collection = component.attached;

                if (collection) {


                    if (!pages[collection?.toString()])
                        await loadCollection(collection);
                    if (pages[collection]) {
                        const pageSetting = pages[collection].pageSetting;
                        if (pageSetting?.populatedRelationships
                            &&
                            component.collStates?.related) {


                            if (!component.collStates.filters)
                                component.collStates.filters = {};

                            for (let i = 0; i <= page.populatedRelationships?.length; i++) {
                                const rel = page.populatedRelationships[i];
                                if (rel) {
                                    component.collStates.filters[`__related_${i}__`] = {
                                        name: 'Related',
                                        type: 'RELATIONSHIPS',

                                        filterKey: [rel._id],
                                        defaultValue: pageSetting.populatedRelationships[rel._id] ? pageSetting.populatedRelationships[rel._id].map(v => v._id) : []

                                    }
                                }
                            }
                        }



                        let collStates = {
                            ...component.collStates,
                            _id: collection,
                            name: pageSetting?.name,
                            slug: pageSetting?.slug,
                            createdAt: pageSetting?.createdAt,
                            creator: pageSetting?.creator,
                            setting: pageSetting?.setting,
                            states: pageSetting?.states,

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
        relationships: 1,

        collStates: 1,
        events: 1,
        _collStates: 1,
        published: 1,

        _forms: 1,
        _elements: 1,
        _components: 1,
        _states: 1,
        _events: 1,

        attached: 1,
        type: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        url: 1,
        slug: 1,
        name: 1,
        _id: 1
    };


    const collections = [

        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 }
        },

        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'setting.populatedImage',
            projection: { src: 1, _id: 1, alt: 1 }

        },
    ];

    const collection = await Collection.document(id, collections, projection);

    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');


    }


    const doc = {
        type: collection.type,
        createdAt: collection.createdAt,
        creator: collection.creator,
        setting: collection.setting,
        populatedRelationships: collection.populatedRelationships,
        name: collection.name,
        slug: collection.slug,

        url: collection.url,
        _id: collection._id
    }
    if (!collection.published) {
        doc.elements = collection._elements;
        doc.components = collection._components;
        doc.forms = collection._forms;
        doc.states = collection._states;
    } else {
        doc.elements = collection.elements;
        doc.components = collection.components;
        doc.forms = collection.forms;
        doc.states = collection.states;
    }



    const chunkStr = JSON.stringify(doc) + '\n';
    stream.push(chunkStr);

    const laoded = { [doc._id]: true };

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
                    projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 }
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
 * Get a collection Style
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        styles: 1,
        _id: 1,
        published: 1,
        _styles: 1,
    };


    const collection = await Collection.findById(id).select(projection);
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }

    const doc = {
        _id: collection._id
    }
    if (!collection.published) {
        doc.styles = collection._styles;
    } else
        doc.styles = collection.styles;

    if (Object.keys(doc.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: doc.styles, _id: doc._id }) + '\n';
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
        _id: 1,
        _forms: 1,
        _components: 1,
        _styles: 1,
    };

    let css = [];

    const collection = await Collection.findById(id).select(projection);
    if (!collection) {
        return { css };
    }

    const doc = {
        _id: collection._id
    }
    if (!collection.published) {
        doc.components = collection._components;
        doc.forms = collection._forms;
        doc.styles = collection._styles;

    } else {
        doc.styles = collection.styles;
        doc.components = collection.components;
        doc.forms = collection.forms;

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

        const res = await mongoose.connection.db.dropCollection(modelName.toLowerCase());

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
    publishCollection,
    getElements,
    getPageData,
    getStyle,
}


