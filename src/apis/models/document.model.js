const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema;
const { toJSON, filter, document, paginate } = require('./plugins')


const Document = (slug) => {


    const DocumentSchema = 
    new Schema(
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
            states: {
                type: Object,
                default: {}
            },
            relationships: {
                type: Object,
                default: {}
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
    );

    DocumentSchema.pre('save', async function (next) {
        const document = this;

        if (!document.isModified('slug')) {
            return next();
        }

        const existingDocument = await document.constructor.findOne({ slug: document.slug });
        if (existingDocument) {
            const error = new Error('Slug already taken');
            error.status = httpStatus.BAD_REQUEST;
            return next(error);
        }

        document.url = `/${document.slug}`


        next();
    });

    DocumentSchema.plugin(paginate)
    DocumentSchema.plugin(document);
    DocumentSchema.plugin(filter);
    
    const Document = mongoose.models[slug] || mongoose.model(slug, DocumentSchema);

    return Document;
}

module.exports = Document;