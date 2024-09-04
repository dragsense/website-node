const mongoose = require('mongoose')
const shortid = require('shortid')
const Schema = mongoose.Schema
const pluralize = require('pluralize')

const { toJSON, document, paginate } = require('./plugins')

const httpStatus = require('http-status')

const CollectionSchema = new Schema(
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
        type: {
            type: String,
            default: 'collection',
        },
        layout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AC_Layout',
            required: true,
        },

        scripts: {
            type: {
                head: {
                    type: String,
                    default: '',
                },
                footer: {
                    type: String,
                    default: '',
                },
                _id: false,
            },
            default: {},
        },
        url: {
            type: String,
        },
        elements: {
            type: Object,
            default: {
                0: {
                    _uid: '0',
                    tagName: 'div',
                    type: 'layout',
                    layout: 'root',
                    name: 'Collection Root Element',
                    nodeValue: '',
                    childNodes: [],
                },
            },
        },
        components: {
            type: Array,
            default: [],
        },
        forms: {
            type: Array,
            default: [],
        },
        styles: {
            type: Object,
            default: {},
        },
        states: {
            type: Object,
            default: {},
        },
        _states: {
            type: Object,
            default: {},
        },
        _components: {
            type: Array,
            default: [],
        },
        _forms: {
            type: Array,
            default: [],
        },
        _elements: {
            type: Object,
            default: {},
        },
        _styles: {
            type: Object,
            default: {},
        },
        published: {
            type: Boolean,
            default: true,
        },
        relationships: {
            type: [{ type: Schema.Types.ObjectId, ref: 'AC_Collection' }],
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
            },
            _id: false,
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
    { timestamps: true }
)

// Pre-save hook for the CollectionSchema
CollectionSchema.pre('save', async function (next) {
    // Define the current collection
    const collection = this

    // Function to handle new and non-duplicated collections
    const handleNewCollection = (collection) => {
        let id = shortid.generate()
        const className = `ac-elem-root-${id}`
        collection.elements['0'].className = className
        collection.elements['0'].selector = `.${className}`

        let styleUid = shortid.generate()
        collection.elements['0'].styleUid = styleUid

        collection.styles = {
            [styleUid]: {
                _uid: styleUid,
                selectorText: `.${className}`,
                type: 'div',
                style: {},
            },
        }
    }

    // If the collection is new and not duplicated, handle it
    if (collection.isNew && !collection.duplicated) {
        handleNewCollection(collection)
    }

    // If the slug is not modified, proceed to the next middleware
    if (!collection.isModified('slug')) {
        return next()
    }

    // Function to check if the slug is already taken
    const isSlugTaken = async (modelName) => {
        const existingCollection = await collection.constructor.findOne({ slug: modelName })
        const Form = mongoose.model('AC_Form')
        const existingForm = await Form.findOne({ slug: modelName })

        const Page = mongoose.model('AC_Page')
        const existingPage = await Page.findOne({ slug: modelName })

        const modelNames = mongoose.modelNames().map((name) => name.toLowerCase())
        const isModelSingular = modelNames.includes(modelName.toLowerCase())
        const isModelPlural = modelNames.includes(pluralize(modelName.toLowerCase()))

        return existingCollection || existingPage || existingForm || isModelSingular || isModelPlural
    }

    // Check if the slug is already taken
    if (await isSlugTaken(collection.slug)) {
        const error = new Error('Slug already taken')
        error.status = httpStatus.BAD_REQUEST
        return next(error)
    }

    const oldSlug = collection.getOriginal('slug');
    const newSlug = collection.slug;

    if (oldSlug && oldSlug !== newSlug) {
        const oldTableName = `ac_${pluralize(oldSlug.toLowerCase())}`
        const newTableName = `ac_${pluralize(newSlug.toLowerCase())}`

        try {
            await mongoose.connection.db.renameCollection(oldTableName, newTableName)
        } catch (err) {
            const error = new Error(`Error renaming table from ${oldTableName} to ${newTableName}: ${err.message}`)
            error.status = httpStatus.INTERNAL_SERVER_ERROR
            return next(error)
        }
    }
    // Set the URL of the collection
    collection.url = `/${newSlug}`

    // Proceed to the next middleware
    next()
})

CollectionSchema.plugin(paginate)
CollectionSchema.plugin(document)

const Collection = mongoose.model('AC_Collection', CollectionSchema)

module.exports = Collection
