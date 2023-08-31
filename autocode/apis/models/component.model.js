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
        collStates: {
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
        styles: {
            type: Object,
            default: {
            },
        },
        states: {
            type: Object,
            default: {}
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

    if (component.isNew && !component.duplicated){ 

        let id = shortid.generate();
        const className = `ac-elem-${id}`;
        component.elements['0'].className = className;
        component.elements['0'].selector = `.${className}`;

        let styleUid = shortid.generate();
        component.elements['0'].styleUid = styleUid;

        component.styles = {
            [styleUid]: {
                _uid: styleUid,
                selectorText: `.${className}`,
                type: 'div',
                style: {
                }
            }
        }
    }

    next();
});


ComponentSchema.plugin(paginate)
ComponentSchema.plugin(document);

const Component = mongoose.model('AC_Component', ComponentSchema);

module.exports = Component;