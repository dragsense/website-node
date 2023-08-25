const mongoose = require('mongoose');
const shortid = require('shortid');
const { toJSON, document, paginate } = require('./plugins')

const Schema = mongoose.Schema;
const httpStatus = require('http-status')



const PageSchema = new Schema(
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
                _id: false
            },
            default: {}
        },
        url: {
            type: String,
        },
        elements: {
            type: Object,
            default: {
                "0": {
                    "_uid": "0",
                    "tagName": "div",
                    "type": "layout",
                    "layout": "root",
                    "nodeValue": "",
                    "childNodes": [],
                }
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
            default: {
            },
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
                _id: false

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
    { timestamps: true }
);

PageSchema.pre('save', async function (next) {

    const page = this;
    
    if (page.isNew && !page.duplicated) {

        let id = shortid.generate();
        const className = `ac-elem-${id}`;
        page.elements['0'].className = className;
        page.elements['0'].selector = `.${className}`;
        let styleUid = shortid.generate();
        page.elements['0'].styleUid = styleUid;

      
            page.styles = {
                [styleUid]: {
                    _uid: styleUid,
                    selectorText: `.${className}`,
                    type: 'div',
                    style: {
                    }
                }
            }
    }


    if (!page.isModified('slug')) {
        return next();
    }

    const modelName = page.slug;


    const existingPage = await page.constructor.findOne({ slug: modelName });

    const Collection = mongoose.model('AC_Collection');
    const existingCollection = await Collection.findOne({ slug: modelName });

    if (existingPage || existingCollection) {
        const error = new Error('Slug already taken');
        error.status = httpStatus.BAD_REQUEST;
        return next(error);
    }
    page.url = `/${page.slug}`

    next();

});

PageSchema.plugin(paginate)
PageSchema.plugin(document);


const Page = mongoose.model('AC_Page', PageSchema);

module.exports = Page;