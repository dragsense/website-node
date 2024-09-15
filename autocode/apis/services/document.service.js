const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')
const he = require('he')

const httpStatus = require('http-status')
const { Collection, Form, Document } = require('../models')
const { updateContentWithType, executeCommand } = require('../../utils/utils')

const ApiError = require('../../utils/api-error')
const pluralize = require('pluralize')
const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs')

const tempDir = path.resolve(process.cwd(), 'private', 'temp')

/**
 * Create a document
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const createDocument = async (collectionId, isForm, documentBody) => {
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    if (documentBody.setting) documentBody.setting.content = he.decode(documentBody.setting.content || '')

    if (documentBody.states) updateContentWithType(documentBody.states, 'content')

    documentBody.coll = { _id: collection._id, slug: collection.slug }

    const DocumentModel = Document(collection.slug)

    return DocumentModel.create(documentBody)
}

/**
 * Update a document
 * @param {String} id
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const updateDocument = async (collectionId, id, isForm, documentBody) => {
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    if (documentBody.setting) documentBody.setting.content = he.decode(documentBody.setting.content || '')

    if (documentBody.states) updateContentWithType(documentBody.states, 'content')

    const modelName = collection.slug
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.findOne({ _id: id })
    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found')
    }

    Object.assign(document, documentBody)
    await document.save()
    return document
}

/**
 * Get Documents
 * @returns {Promise<Document[]>}
 */
const getDocuments = async (collectionId, isForm, filter, options) => {
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
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
    }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)
    console.log()
    const documents = await DocumentModel.paginate(filter, options, projection)
    return documents
}

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
            projection: { name: 1, slug: 1, _id: 1 },
        },
    ]

    let projection = {
        slug: 1,
        _id: 1,
        relationships: 1,
    }

    const collection = isForm
        ? await Form.document(collectionId, [], projection)
        : await Collection.document(collectionId, collections, projection)
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    const relationships = isForm
        ? []
        : [
              ...collection.populatedRelationships.map((rel) => {
                  const modelName = rel.slug.toLowerCase()
                  return {
                      collectionName: modelName,
                      localField: `relationships.${rel._id}`,
                      foreignField: '_id',

                      as: `populatedRelationships.${rel._id}`,
                      projection: { name: 1, _id: 1 },
                  }
              }),
              {
                  collectionName: 'ac_medias',
                  localField: 'setting.image',
                  foreignField: '_id',
                  as: 'populatedImage',
                  projection: { src: 1, _id: 1, alt: 1 },
              },
          ]

    projection = { name: 1, slug: 1, _id: 1, setting: 1, relationships: 1, states: 1 }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.document(id, relationships, projection)

    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found')
    }
    return document
}

/**
 * Duplicate a document
 * @returns {Promise<Document>}
 */
const duplicateDocument = async (collectionId, id, isForm) => {
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)
    const document = await DocumentModel.duplicate(id)
    return document
}

/**
 * Delete a document
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteDocument = async (collectionId, id, isForm) => {
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)

    const document = await DocumentModel.deleteOne({ _id: id })
    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found')
    }
    return id
}

/**
 * Download documents as CSV using mongoexport with filtering
 * @param {String} collectionId - The ID of the collection or form
 * @param {Boolean} isForm - Whether it's a form or collection
 * @param {Object} filter - MongoDB query filter
 * @param {Object} options - Additional options like sorting, pagination (to be handled separately)
 * @returns {Promise<String>} - Path to the exported CSV file
 */
const downloadDocuments = async (collectionId, isForm, filter, options, host) => {
    // Fetch collection or form
    const collection = isForm ? await Form.findOne({ _id: collectionId }) : await Collection.findOne({ _id: collectionId })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `${isForm ? 'Form' : 'Collection'} not found`)
    }

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    // Build model name dynamically based on the collection slug
    let modelName = collection.slug
    // Database connection
    const DocumentModel = Document(modelName)

    const results = await DocumentModel.filterAllDocuments([], [], filter, options)

    const stateKeys = collection.states ? Object.keys(collection.states).map((key) => `states.${key}`) : []

    // Transform data to include custom fields
    const documents = results.documents.map((doc) => {
        // Flatten `states` object into an object with key-value pairs
        const statesObject = doc.states
            ? Object.keys(doc.states).reduce((accum, key) => {
                  accum[`states.${key}`] = doc.states[key].defaultValue || ''
                  return accum
              }, {})
            : {}

        // Merge `statesObject` into the main object
        return {
            name: doc.name || '',
            ...statesObject,
            ...(doc.setting
                ? {
                      'setting.title': doc.setting.title || '',
                      'setting.desc': doc.setting.desc || '',
                      'setting.image': doc.setting.image || '',
                      'setting.content': doc.setting.content || '',
                      'setting.excerpt': doc.setting.excerpt || '',
                      'setting.status': doc.setting.status || '',
                      'setting.image': doc.setting.populatedImage ? host + doc.setting.populatedImage?.src : '',
                  }
                : {}),
            creator: doc.creator?.name,
            createdAt: doc.createdAt,
        }
    })

    // Combine static and dynamic fields
    const fields = [
        'name',
        ...stateKeys,
        'setting.title',
        'setting.desc',
        'setting.image',
        'setting.content',
        'setting.excerpt',
        'setting.status',
        'creator',
        'createdAt',
    ]

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    // Add header row
    worksheet.addRow(fields)

    // Add data rows
    documents.forEach((doc) => {
        worksheet.addRow([
            doc.name || '',
            ...stateKeys.map((key) => doc[key] || ''),
            doc['setting.title'] || '',
            doc['setting.desc'] || '',
            doc['setting.image'] ? { text: `Image (${doc['setting.image']})`, hyperlink: doc['setting.image'] } : '',
            doc['setting.content'] || '',
            doc['setting.excerpt'] || '',
            doc['setting.status'] || '',
            doc.creator,
            doc.createdAt,
        ])
    })

    // Add total row
    const total = documents.length // Calculate total based on your logic
    const totalRow = worksheet.addRow(['', '', '', 'Total', '', total])

    // Apply formatting to the total row
    totalRow.font = { bold: true, size: 24 }

    const outputPath = path.join(tempDir, `${modelName}-export.xlsx`)

    try {
        // Write Excel file to disk
        await workbook.xlsx.writeFile(outputPath)
        console.log(`Excel file created at ${outputPath}`)
    } catch (e) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Something went wrong.')
    }

    return outputPath
}

/**
 * Get filtered documents
 * @param {String} id
 * @returns {Promise<Document[]>}
 */
const getFilteredDocuments = async (collectionId, documentBody, options) => {
    let { documentIds, filters, withRelationship, selectedRelationships } = documentBody

    const collections = withRelationship
        ? [
              {
                  collectionName: 'ac_collections',
                  localField: 'relationships',
                  foreignField: '_id',

                  as: 'populatedRelationships',
                  projection: { name: 1, slug: 1, _id: 1 },
              },
          ]
        : []

    let projection = {
        slug: 1,
        _id: 1,
        relationships: 1,
    }

    const collection = await Collection.document(collectionId, collections, projection)

    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `Collection not found`)
    }

    if (!documentIds || documentIds?.length <= 0) throw new ApiError(httpStatus.NOT_FOUND, `Not Found.`)

    const docIds = Array.isArray(documentIds) ? documentIds : [documentIds]

    let relationships = []
    if (withRelationship && collection.populatedRelationships) {
        relationships = collection.populatedRelationships
            .filter((relation) => selectedRelationships.some((_id) => _id === relation._id.toString()))
            .map((rel) => {
                const modelName = rel.slug.toLowerCase()

                return {
                    collectionName: modelName,
                    localField: `relationships.${rel._id}`,
                    foreignField: '_id',
                    as: `populatedRelationships.${rel._id}`,
                    projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 },
                }
            })
    }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)

    const otherCollections = [
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'populatedImage',
            projection: { src: 1, _id: 1, alt: 1 },
        },
    ]

    const results = await DocumentModel.filterDocuments(docIds, filters, relationships, otherCollections, options)

    return results
}

/**
 * Get all filtered documents
 * @param {String} id
 * @returns {Promise<Document[]>}
 */
const getAllFilteredDocuments = async (collectionId, documentBody, filter, options) => {
    let { filters, withRelationship, selectedRelationships } = documentBody

    const collections = withRelationship
        ? [
              {
                  collectionName: 'ac_collections',
                  localField: 'relationships',
                  foreignField: '_id',

                  as: 'populatedRelationships',
                  projection: { name: 1, slug: 1, _id: 1 },
              },
          ]
        : []

    let projection = {
        slug: 1,
        _id: 1,
        relationships: 1,
    }

    const collection = await Collection.document(collectionId, collections, projection)

    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, `Collection not found`)
    }

    let relationships = []
    if (withRelationship && Array.isArray(collection.populatedRelationships)) {
        relationships = collection.populatedRelationships
            .filter((relation) => selectedRelationships.some((_id) => _id === relation._id.toString()))
            .map((rel) => {
                const modelName = rel.slug.toLowerCase()

                return {
                    collectionName: modelName,
                    localField: `relationships.${rel._id}`,
                    foreignField: '_id',
                    as: `populatedRelationships.${rel._id}`,
                    projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 },
                }
            })
    }

    const modelName = collection.slug
    const DocumentModel = Document(modelName)

    const otherCollections = [
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'setting.populatedImage',
            projection: { src: 1, _id: 1, alt: 1 },
        },
    ]

    const results = await DocumentModel.filterAllDocuments(filters, relationships, filter, options, otherCollections)

    return results
}

module.exports = {
    getDocuments,
    getDocument,
    deleteDocument,
    updateDocument,
    duplicateDocument,
    createDocument,
    downloadDocuments,
    getFilteredDocuments,
    getAllFilteredDocuments,
}
