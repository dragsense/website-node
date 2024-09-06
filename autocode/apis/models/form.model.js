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
                    name: 'Form Root Element',
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
        _states: {
            type: Object,
            default: {}
        },
        _components: {
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

    // If the form is new and not duplicated, generate unique identifiers and styles
    if (form.isNew && !form.duplicated){ 
        generateUniqueIdentifiersAndStyles(form);
    }

    // If the slug field is not modified, proceed to the next middleware
    if (!form.isModified('slug')) {
        return next();
    }

    // Check if the slug already exists in the database
    const isSlugTaken = await checkSlugExistence(form);

    // If the slug is taken, return an error
    if (isSlugTaken) {
        const error = new Error('Slug already taken');
        error.status = httpStatus.BAD_REQUEST;
        return next(error);
    }

    // Proceed to the next middleware
    next();
});

// Function to generate unique identifiers and styles for a form
async function generateUniqueIdentifiersAndStyles(form) {
    let id = shortid.generate();
    const className = `ac-elem-form-root-${id}`;
    form.elements['0'].className = className;
    form.elements['0'].selector = `.${className}`;

    let styleUid = shortid.generate();
    form.elements['0'].styleUid = styleUid;

    form.styles = {
        [styleUid]: {
            _uid: styleUid,
            selectorText: `.${className}`,
            type: 'div',
            style: {}
        }
    }
}

// Function to check if the slug already exists in the database
async function checkSlugExistence(form) {
    const modelName = form.slug;

    const existingForm = await form.constructor.findOne({ slug: modelName });

    const Collection = mongoose.model('AC_Collection');
    const existingCollection = await Collection.findOne({ slug: modelName });
    const Page = mongoose.model('AC_Page');
    const existingPage = await Page.findOne({ slug: modelName });

    const modelNames = mongoose.modelNames().map(name => name.toLowerCase());
    const isModelSingular = modelNames.includes(modelName.toLowerCase());
    const isModelPlural = modelNames.includes(pluralize(modelName.toLowerCase()));

    return existingCollection || existingPage || existingForm || isModelSingular || isModelPlural;
}

FormSchema.plugin(paginate)
FormSchema.plugin(document);

const Form = mongoose.model('AC_Form', FormSchema);

module.exports = Form;