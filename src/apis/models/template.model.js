const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema;


const TemplateSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            default: "",
        },
        screenShotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AC_Media',
            default: null,
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
                    "className": "",
                    "selector": "",
                    "childNodes": []
                }
            },
        },
        styles: {
            type: Object,
            default: {
            },
        },
        categories: {
            type: Array,
            default: []
        },
        updater: {
            type: Object,
            default: {},
        },
        creator: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

TemplateSchema.pre('save', function (next) {

    next();
});

const Template = mongoose.model('AC_Template', TemplateSchema);

module.exports = Template;