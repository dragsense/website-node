const mongoose = require('mongoose');
const shortid = require('shortid');
const pluralize = require('pluralize');
const httpStatus = require('http-status')

const Schema = mongoose.Schema;
const { toJSON, document, paginate } = require('./plugins');


const FormSchema = new Schema(
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
            default: "form",
        },
        record: {
            type: Boolean,
            default: false,
        },
        recordOnly: {
            type: Boolean,
            default: false,
        },
        emailbody: {
            type: {
                plain: {
                    type: String,
                    default: '',
                },
                head: {
                    type: String,
                    default: '',
                },
                body: {
                    type: String,
                    default: '',
                },
                footer: {
                    type: String,
                    default: '',
                },
                html: {
                    type: Boolean,
                    default: false,
                },
                _id: false,
            },
            default: { plain: "", html: false }
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
                    "childNodes": []
                }
            },
        },
        components: {
            type: Array,
            default: [],
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
        setting: {
            type: {
                to: {
                    type: String,
                    validate: {
                        validator: function (value) {
                         
                            return true;

                            const emails = value.split(',').map((email) => email.trim());

                            const isValidEmail = emails.every((email) =>
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
                            );

                            return isValidEmail;
                        },
                        message: 'Invalid email format for "to" field',
                    }, default: ''
                },
                from: {
                    type: String,
                    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                    default: '',
                },
                subject: {
                    type: String,
                    default: 'Untitled Email',
                },
                cc: {
                    type: String,
                    validate: {
                        validator: function (value) {

                            return true;


                            const emails = value.split(',').map((email) => email.trim());

                            const isValidEmail = emails.every((email) =>
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
                            );

                            return isValidEmail;
                        },
                    },
                    default: '',
                },
                bcc: {
                    type: String,
                    validate: {
                        validator: function (value) {

                            return true;


                            const emails = value.split(',').map((email) => email.trim());

                            const isValidEmail = emails.every((email) =>
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
                            );

                            return isValidEmail;
                        },
                    },
                    default: '',
                },
                replyTo: {
                    type: String,
                    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,

                    default: '',
                },
                redirect: {
                    type: String,
                    default: '',
                    validate: {
                        validator: function (value) {

                            return true;


                            if (value.trim() !== '') {
                                const urlRegex = /^(https?:\/\/)/i;
                                return urlRegex.test(value);
                            }
                            return true;
                        },
                        message: 'Invalid redirect URL',
                    },
                },
                successMessage: {
                    type: String,
                    default: '',
                },
                errorMessage: {
                    type: String,
                    default: '',
                },
                sendCopy: {
                    type: Boolean,
                    default: false,
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

FormSchema.pre('save', async function (next) {

    const form = this;

    if (form.isNew && !form.duplicated){ 

        let id = shortid.generate();
        const className = `ac-elem-${id}`;
        form.elements['0'].className = className;
        form.elements['0'].selector = `.${className}`;

        let styleUid = shortid.generate();
        form.elements['0'].styleUid = styleUid;

        form.styles = {
            [styleUid]: {
                _uid: styleUid,
                selectorText: `.${className}`,
                type: 'div',
                style: {
                }
            }
        }
    }

    if (!form.isModified('slug')) {
        return next();
    }

    const modelName = form.slug;

    const existingForm = await form.constructor.findOne({ slug: modelName });

    const Collection = mongoose.model('AC_Collection');
    const existingCollection = await Collection.findOne({ slug: modelName });
    const Page = mongoose.model('AC_Page');

        const existingPage = await Page.findOne({ slug: modelName });


    const modelNames = mongoose.modelNames().map(name => name.toLowerCase());
    const isModelSingular = modelNames.includes(modelName.toLowerCase());
    const isModelPlural = modelNames.includes(pluralize(modelName.toLowerCase()));

    if (existingCollection || existingPage || existingForm || isModelSingular || isModelPlural) {

        const error = new Error('Slug already taken');
        error.status = httpStatus.BAD_REQUEST;
        return next(error);
    }

    next();
});

FormSchema.plugin(paginate)
FormSchema.plugin(document);

const Form = mongoose.model('AC_Form', FormSchema);

module.exports = Form;