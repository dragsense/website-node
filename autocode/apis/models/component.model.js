const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema;
const { toJSON, document, paginate } = require('./plugins')


const ComponentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "component",
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AC_Component',
        },

        elements: {
            type: Object,
            default: {
                "0": {
                    "_uid": "0",
                    "tagName": "div",
                    "type": "layout",
                    "layout": "root",
                    name: 'Component Root Element',
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
        attached: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AC_Collection',
        },
        _collStates: {
            type: Object,
            default: {
                limit: 10,
                page: 1,
                sort: 'asc',
                sortBy: 'createdAt',
                loadMore: false,
                withRelationship: false,
                docs: [],
                selectedRelationships: [],
                maxPage: 0,
                pagination: {
                    leftRange: 1, rightRange: 1, nearRange: 4, dots: "..."
                }
            }
        },
        collStates: {
            type: Object,
            default: {

            }
        },
        styles: {
            type: Object,
            default: {
            },
        },
        states: {
            type: Object,
            default: {}
        },
        events: {
            type: Object,
            default: {}
        },
        _events: {
            type: Object,
            default: {}
        },
        _states: {
            type: Object,
            default: {}
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

ComponentSchema.pre('save', async function (next) {
    const component = this;


    const handleNewComponent = (collection) => {
        let id = shortid.generate()
        const className = `ac-elem-component-root-${id}`
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

    // If the collection is new a
    // Check if the component is new and not duplicated
    if (component.isNew && !component.duplicated) {
        // Generate unique IDs for the component and its style
        handleNewComponent(component);
    }

    // Proceed to the next middleware
    next();
});




ComponentSchema.plugin(paginate)
ComponentSchema.plugin(document);

const Component = mongoose.model('AC_Component', ComponentSchema);

module.exports = Component;