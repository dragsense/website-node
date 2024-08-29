const mongoose = require('mongoose')
const shortid = require('shortid')
const pluralize = require('pluralize');

const Schema = mongoose.Schema
const { toJSON, filter, document, paginate } = require('./plugins')

const Document = (slug) => {
    const DocumentSchema = new Schema(
        {
            name: {
                type: String,
                required: true,
            },
            slug: {
                type: String,
                required: true,
                unique: true,
            },
            url: {
                type: String,
            },
            coll: {
                type: {
                    _id: {
                        type: Schema.Types.ObjectId,
                        ref: 'AC_Collection',
                    },
                    slug: {
                        type: String,
                        required: true,
                    },
                },
                required: true,
            },
            states: {
                type: Object,
                default: {},
            },
            relationships: {
                type: Map,
                of: [
                    {
                        type: Schema.Types.ObjectId,
                    },
                ],
                default: new Map(),
            },
            setting: {
                type: {
                    title: {
                        type: String,
                        default: '',
                    },
                    desc: {
                        type: String,
                        default: '',
                    },
                    image: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'AC_Media',
                    },
                    content: {
                        type: String,
                        default: '',
                    },
                    excerpt: {
                        type: String,
                        default: '',
                    },
                    status: {
                        type: String,
                        enum: ['DRAFT', 'PRIVATE', 'PUBLIC'],
                        default: 'DRAFT',
                    },
                    _id: false,
                },
                default: {},
            },
            updater: {
                type: Object,
                default: {},
            },
            duplicated: {
                type: Boolean,
                default: false,
            },
            creator: {
                type: Object,
                default: {},
            },
        },
        { timestamps: true, collection: slug }
    )

    // Pre-save middleware function
    DocumentSchema.pre('save', async function (next) {
        const document = this

        // Check if the slug field is modified
        if (!document.isModified('slug')) {
            return next()
        }

        // Check if the slug already exists in the database
        const existingDocument = await checkSlugExistence(document)
        if (existingDocument) {
            const error = new Error('Slug already taken')
            error.status = httpStatus.BAD_REQUEST
            return next(error)
        }

        // Generate the document URL
        generateDocumentUrl(document)

        next()
    })

    // Function to check if the slug already exists in the database
    async function checkSlugExistence(document) {
        return await document.constructor.findOne({ slug: document.slug })
    }

    // Function to generate the document URL
    function generateDocumentUrl(document) {
        const coll = document.coll
        document.url = `/${coll.slug}/${document.slug}`
    }

    DocumentSchema.plugin(paginate)
    DocumentSchema.plugin(document)
    DocumentSchema.plugin(filter)

    const modelName = 'ac_' + pluralize(slug.toLowerCase())

    const Document = mongoose.models[modelName] || mongoose.model(modelName, DocumentSchema)

    return Document
}

module.exports = Document
