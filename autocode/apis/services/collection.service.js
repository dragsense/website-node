// Importing required modules and dependencies
const { Collection } = require('../models');
const he = require('he');

const { updateContentWithType } = require('../../utils/utils');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../../utils/api-error');


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

        if (collectionBody.states) {
            collection._states = collectionBody.states;
        }
    

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

// Function to restore a collection
const restoreCollection = async (id, collectionBody) => {
    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found.');
    }

    const { updater } = collectionBody;

    if (collection.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'There are no new draft changes to restore.');
    }
    
    collection._elements = collection.elements;
    collection._components = collection.components;
    collection._forms = collection.forms;
    collection._styles = collection.styles;
    collection._states = collection.states;

    collection.updater = updater;
    collection.published = true;


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


        const modelName = 'ac_' + pluralize(collection.slug.toLowerCase())

        const res = await mongoose.connection.db.dropCollection(modelName);

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
    publishCollection,
    restoreCollection,
    getStyle,
}


