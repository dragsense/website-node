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
                    name: 'Page Root Element',
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
            default: {}
        },
        _styles: {
            type: Object,
            default: {
            },
        },
        published: {
            type: Boolean,
            default: true,
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

    // If the page is new and not duplicated, generate unique identifiers and set up styles
    if (page.isNew && !page.duplicated) {
        setupNewPage(page);
    }

    // If the slug is not modified, proceed to the next middleware
    if (!page.isModified('slug')) {
        return next();
    }

    // Check if the slug is already taken
    const isSlugTaken = await checkSlug(page);

    if (isSlugTaken) {
        const error = new Error('Slug already taken');
        error.status = httpStatus.BAD_REQUEST;
        return next(error);
    }

    // Set the URL of the page
    page.url = `/${page.slug}`

    next();

});

/**
 * Setup new page with unique identifiers and styles
 * @param {Object} page - The page object
 */
function setupNewPage(page) {
    let id = shortid.generate();
    const className = `ac-elem-page-root-${id}`;
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

/**
 * Check if the slug is already taken
 * @param {Object} page - The page object
 * @return {Promise<boolean>} - A promise that resolves to a boolean indicating whether the slug is taken
 */
async function checkSlug(page) {
    const modelName = page.slug;

    const existingPage = await page.constructor.findOne({ slug: modelName });

    const Collection = mongoose.model('AC_Collection');
    const existingCollection = await Collection.findOne({ slug: modelName });

    return existingPage || existingCollection;
}

PageSchema.plugin(paginate)
PageSchema.plugin(document);


const Page = mongoose.model('AC_Page', PageSchema);

module.exports = Page;