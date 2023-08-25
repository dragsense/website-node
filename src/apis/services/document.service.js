

const mongoose = require('mongoose');
const he = require('he');

const httpStatus = require('http-status')
const { Collection, Form, Document } = require('../models');
const { updateContentWithType } = require('../../utils/utils');

const ApiError = require('../../utils/api-error')
const pluralize = require('pluralize');


/**
 * Create a document
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const createDocument = async (collectionId, isForm, documentBody) => {


    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }

    if (documentBody.setting)
        documentBody.setting.content = he.decode(documentBody.setting.content)

    if (documentBody.states)
        updateContentWithType(documentBody.states, 'content')


    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    return DocumentModel.create(documentBody);
};

/**
 * Update a document
 * @param {String} id
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const updateDocument = async (collectionId, id, isForm, documentBody) => {

    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }

    if (documentBody.setting)
        documentBody.setting.content = he.decode(documentBody.setting.content)

    if (documentBody.states)
        updateContentWithType(documentBody.states, 'content')

    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.findOne({ _id: id })
    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }


    Object.assign(document, documentBody);
    await document.save();
    return document;
};

/**
 * Get Documents
 * @returns {Promise<Document[]>}
 */
const getDocuments = async (collectionId, isForm, filter, options) => {

    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }




    const projection = {
        name: 1,
        slug: 1,
        collectionId: 1,
        'setting.status': 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        updater: 1,
        _id: 1,
    };


    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    const documents = await DocumentModel.paginate(filter, options, projection);
    return documents;

};



/**
 * Get a document
 * @param {String} id
 * @returns {Promise<Document>}
 */
const getDocument = async (collectionId, id, isForm) => {

    const collections = [

        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, slug: 1, _id: 1 }
        },
     
    ];


    let projection = {
        slug: 1,
        _id: 1,
        relationships: 1,
    };





    const collection = isForm ? await Form.document(collectionId, collections, projection) : await Collection.document(collectionId, collections, projection)
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }


    const relationships = [

        ...(collection.populatedRelationships.map(rel => {
            const modelName = pluralize.plural(rel.slug.toLowerCase());
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
            as: 'populatedImage',
            projection: { src: 1, _id: 1, alt: 1 }

        },
    ];


    projection = { name: 1, slug: 1, _id: 1, setting: 1, relationships: 1, states: 1 };

    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.document(id, relationships, projection)


    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }
    return document;
};

/**
 * Duplicate a document
 * @returns {Promise<Document>}
 */
const duplicateDocument = async (collectionId, id, isForm) => {

    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }

    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.duplicate(id);
    return document;
};



/**
 * Delete a document
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteDocument = async (collectionId, id, isForm) => {


    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`);
    }

    const modelName = collection.slug;
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.deleteOne({ _id: id })
    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }
    return id;
};


/**
 * Get filtered documents
 * @param {String} id
 * @returns {Promise<Document[]>}
 */
const getFilteredDocuments = async (collectionId, documentBody) => {

    const collection = await Collection.findById(collectionId)
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `Collection not found`);
    }

    let { documentIds, withRelationship, selectedRelationships } = documentBody;

    if (!documentIds || documentIds?.length <= 0)
        throw new ApiError(httpStatus.NOT_FOUND, `Not Found.`);

    const docIds = Array.isArray(documentIds) ? documentIds : [documentIds];

    let relationships = undefined;

    if (withRelationship && Array.isArray(selectedRelationships) && Array.isArray(collection.relationships)) {
        relationships = collection.relationships.filter(relation => selectedRelationships.some(selected => relation._id == selected._id))
    }

    const modelName = collection.slug;
    const DocumentModel = Document(modelName);


    const collections = [
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'populatedImage',
            projection: { src: 1, _id: 1, alt: 1 }

        },
    ];


    const results = await DocumentModel.filterDocuments(docIds, relationships, collections);

    return results;

};

/**
 * Get all filtered documents
 * @param {String} id
 * @returns {Promise<Document[]>}
 */
const getAllFilteredDocuments = async (collectionId, documentBody, filter, options) => {


    let { filters, withRelationship, selectedRelationships } = documentBody;



    const collections = withRelationship ? [
        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, slug: 1, _id: 1 }
        },

    ] : [];


    let projection = {
        slug: 1,
        _id: 1,
        relationships: 1,
    };





    const collection = await Collection.document(collectionId, collections, projection)


    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `Collection not found`);
    }


    let relationships = [];
    if (withRelationship && collection.populatedRelationships) {
        relationships = collection.populatedRelationships.filter(relation =>
            selectedRelationships.some(_id => _id === relation._id.toString())
        ).map(rel => {
            const modelName = pluralize.plural(rel.slug.toLowerCase());

            return {
                collectionName: modelName,
                localField: `relationships.${rel._id}`,
                foreignField: '_id',
                as: `populatedRelationships.${rel._id}`,
                projection: { name: 1, _id: 1, setting: 1, states: 1,  }
               
            }
        })
    }

    const modelName = collection.slug;
    const DocumentModel = Document(modelName);


    const otherCollections = [
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'populatedImage',
            projection: { src: 1, _id: 1, alt: 1 }

        },
    ];


    const results = await DocumentModel.filterAllDocuments(filters, relationships, filter, options, otherCollections);


    return results;

};




module.exports = {
    getDocuments,
    getDocument,
    deleteDocument,
    updateDocument,
    duplicateDocument,
    createDocument,
    getFilteredDocuments,
    getAllFilteredDocuments
}