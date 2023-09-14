const { Form, Document, Component, Collection, } = require('../models');
const { generateCss, generateElementsCss, getCurrentDate } = require('../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const pluralize = require('pluralize');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const httpStatus = require('http-status')
const he = require('he');
const settingService = require('./setting.service');
const mediaService = require('./media.service');
const ApiError = require('../../utils/api-error')
const path = require('path');
const fs = require('fs');

const publicDir = path.resolve(process.cwd(), 'public/static/uploads');

/**
 * Create a form
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const createForm = async (formBody) => {

    if (formBody.emailbody)
        formBody.emailbody.head = he.decode(formBody.emailbody.head)

    if (formBody.emailbody)
        formBody.emailbody.body = he.decode(formBody.emailbody.body)


    if (formBody.emailbody)
        formBody.emailbody.footer = he.decode(formBody.emailbody.footer)



    return Form.create(formBody);
};

/**
 * Update a form
 * @param {String} id
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const updateForm = async (id, formBody) => {

    const form = await Form.findOne({ _id: id })
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    if (formBody.emailbody)
        formBody.emailbody.head = he.decode(formBody.emailbody.head)

    if (formBody.emailbody)
        formBody.emailbody.body = he.decode(formBody.emailbody.body)


    if (formBody.emailbody)
        formBody.emailbody.footer = he.decode(formBody.emailbody.footer)



    Object.assign(form, formBody);
    await form.save();
    return form;
};

/**
 * Update a form Elements
 * @param {String} id
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const updateElements = async (id, formBody) => {

    const form = await Form.findOne({ _id: id })
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    form.published = false;

    Object.assign(form, formBody);
    await form.save();
    return form;
};



/**
 * Publish a form
 * @param {String} id
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const publishForm = async (id, formBody) => {

    const form = await Form.findOne({ _id: id })
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found.');
    }

    const { updater } = pageBody;

    if (form.published) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form is already published.');
    }

    form.elements = form._elements;
    form.components = form._components;
    form.styles = form._styles;

    form.published = true;

    form.updater = updater
    
    Object.assign(form, formBody);
    await form.save();
    return form;
};

/**
 * Update a form Style
 * @param {String} id
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const updateStyle = async (id, formBody) => {

    const form = await Form.findOne({ _id: id })
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    Object.assign(form, formBody);
    await form.save();
    return form;
};

/**
 * Get Forms
 * @returns {Promise<Form[]>}
 */
const getForms = async (filter, options) => {

    const projection = {
        name: 1,
        slug: 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        updater: 1,
        _id: 1,
    };


    const forms = await Form.paginate(filter, options, projection);
    return forms;

};

/**
 * Get a form
 * @param {String} id
 * @returns {Promise<Form>}
 */
const getForm = async (id) => {


    const projection = { name: 1, slug: 1, type: 1, _id: 1, setting: 1, emailbody: 1, record: 1, recordOnly: 1, states: 1 };


    const form = await Form.document(id, [], projection)
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }
    return form;

};


/**
 * Get a form Elements
 * @param {String} id
 * @returns {Promise<Form>}
 */
const getElements = async (id, stream) => {


    const projection = {
        elements: 1,
        components: 1,
        states: 1,
        setting: 1,
        forms: 1,

        collStates: 1,
        events: 1,
        _collStates: 1,
        published: 1,
       _forms: 1,
        _elements: 1,
        _components: 1,
        _states: 1,
        _events: 1,

        creator: 1,
        createdAt: 1,
        type: 1,
        _id: 1
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    const doc = {
        type: form.type,
        createdAt: form.createdAt,
        creator: form.creator,
        _id: form._id
    }
    if (!form.published) {
        doc.elements = form._elements;
        doc.components = form._components;
        doc.states = form._states;

    } else {
        doc.elements = form.elements;
        doc.components = form.components;
        doc.states = form.states;

    }

    const chunkStr = JSON.stringify(doc) + '\n';
    stream.push(chunkStr);



    const laoded = {};

    const loadCollection = async (collection, projection = {
        states: 1,
        relationships: 1,
        setting: 1,
        name: 1,
        _id: 1
    }) => {
        if (collection && !laoded[collection]) {
            laoded[collection] = true

            const collections = [

                {
                    collectionName: 'ac_collections',
                    localField: 'relationships',
                    foreignField: '_id',

                    as: 'populatedRelationships',
                    projection: { name: 1, slug: 1, _id: 1, states: 1 }
                },

            ];


            const coll = await Collection.document(collection._id, collections, projection);
            if (coll) {
                const chunkStr = JSON.stringify(coll) + '\n';
                stream.push(chunkStr);
            }

        }
    }

    const loadForms = async (forms, projection) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form && !laoded[forms[i]]) {
                laoded[form[i]] = true;

                const doc = {

                    type: form.type,
                    attached: form.attached,
                    createdAt: form.createdAt,
                    creator: form.creator,
                    setting: form.setting,
                    url: form.url,
                    _id: form._id
                }
                if (!form.published) {
                    doc.elements = form._elements;
                    doc.components = form._components;
                    doc.forms = form._forms;
                    doc.states = form._states;
                    doc.collStates = form._collStates;
                } else {
                    doc.elements = form.elements;
                    doc.components = form.components;
                    doc.forms = form.forms;
                    doc.states = form.states;
                    doc.collStates = form.collStates;
                }

                const chunkStr = JSON.stringify(doc) + '\n';
                stream.push(chunkStr);

                laoded[form[i]] = true;

                const innerComponents = doc.components || [];
                await loadComponents(innerComponents, projection)

                const forms = doc.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component && !laoded[components[i]]) {
                laoded[components[i]] = true;

                const doc = {
                    parent: component.parent,
                    type: component.type,
                    attached: component.attached,
                    createdAt: component.createdAt,
                    creator: component.creator,
                    setting: component.setting,
                    url: component.url,
                    _id: component._id
                }
                if (!component.published) {
                    doc.elements = component._elements;
                    doc.components = component._components;
                    doc.forms = component._forms;
                    doc.states = component._states;
                    doc.collStates = component._collStates;
                } else {
                    doc.elements = component.elements;
                    doc.components = component.components;
                    doc.forms = component.forms;
                    doc.states = component.states;
                    doc.collStates = component.collStates;
                }

                const chunkStr = JSON.stringify(doc) + '\n';
                stream.push(chunkStr);

                const collection = component.attached;
                if (collection)
                    await loadCollection(collection);

                const innerComponents = doc.components || [];


                await loadComponents(innerComponents)

                const forms = doc.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const components = doc.components || [];
    const forms = doc.forms || [];

    await loadComponents(components, projection);
    await loadForms(forms, projection)




    stream.push(null);

};



/**
 * Get a form Style
 * @param {String} id
 * @returns {Promise<Form>}
 */
const getStyle = async (id, stream) => {


    const projection = {
        styles: 1,
        _id: 1,
        published: 1,
        _styles: 1,
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    const doc = {
        _id: form._id
    }
    if (!form.published) {
        doc.styles = form._styles;
    } else
        doc.styles = form.styles;

    if (Object.keys(doc.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: doc.styles, _id: doc._id }) + '\n';
        stream.push(chunkStr);
    }

    stream.push(null);


};


/**
 * Get a form Css
 * @param {String} id
 * @returns {Promise<CSS>}
 */
const getCss = async (id) => {


    const projection = {
        styles: 1,
        elements: 1,
        published: 1,
        _components: 1,
        _styles: 1,
        _id: 1
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }
    let css = [];

    const doc = {
        _id: form._id
    }
    if (!form.published) {
        doc.components = form._components;
        doc.forms = form._forms;
        doc.styles = form._styles;

    } else {
        doc.styles = form.styles;
        doc.components = form.components;
        doc.forms = form.forms;

    }



   
    const styles = doc.styles || {};



    css = [...css, generateElementsCss(styles, doc._id)];

    const components = doc.components || [];

    const loadComponentsCSS = async (components) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component) {

                const doc = {
                    _id: component._id
                }
                if (!component.published) {
                    doc.components = component._components;
                    doc.styles = component._styles;
                    doc.forms = component._forms;


                } else {
                    doc.styles = component.styles;
                    doc.components = component.components;
                    doc.forms = component.forms;

                }

                let styles = doc.styles || {};
                css = [...css, generateElementsCss(styles, doc._id)];

                const innerComponents = doc.components || [];

                await loadComponentsCSS(innerComponents)
                const forms = doc.forms || [];
                await loadFormsCSS(forms);
            }
        }
    }

    await loadComponentsCSS(components);

    return { css }

};


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


/**
 * Duplicate Form
 * @returns {Promise<Form>}
 */
const duplicateForm = async (id) => {

    const form = await Form.duplicate(id);
    return form;
};



/**
 * Delete a form
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteForm = async (id) => {
    try {
        const form = await Form.findOneAndDelete({ _id: id });

        if (!form) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
        }

        const modelName = form.slug;

        const res = await mongoose.connection.db.dropCollection(modelName);

        if (!res) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Documents not found');
        }

        return id;
    } catch (error) {
        // Handle errors here
        if (error instanceof ApiError) {
            throw error; // Re-throw custom API error
        } else if (error.name === 'MongoError' && error.code === 26) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
        } else if (error.name === 'MongoError' && error.code === 26) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Documents not found');
        } else {
            console.error('An unexpected error occurred:', error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
        }
    }
};

/**
 * Submit a form
 * @param {String} id
 * @param {Object} formBody
 * @returns {Promise<>}
 */
const submit = async (files, id, states) => {


    const form = await Form.findById(id)
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    const formStates = form.states;

    let isValid = true;

    Object.keys(formStates).forEach((key) => {
        const stateData = formStates[key];

        if (stateData.type !== 'file') {
            const fieldData = states[key];

            let regexTest = true;

            if (stateData.regex) {
                const regexString = stateData.regex;
                const cleanedRegexString = regexString.replace(/^\/|\/$/g, '');
                const regex = new RegExp(cleanedRegexString);

                regexTest = regex.test(fieldData)
            }

            if ((stateData.required && !fieldData) || !regexTest) {
                stateData.error = 1;
                isValid = false;
            }
            else {
                stateData.error = 0;
                formStates[key].defaultValue = fieldData;
            }
        }
    });

    if (!isValid) {

        if (files) {

            files.forEach(f => {
                const file = f.file;
                const path = `${publicDir}/temp/${file.filename}`;

                fs.unlink(path, (err) => {
                    if (err) {
                        console.error(err)
                    }
                })
            })

        }

        throw new ApiError(httpStatus[403], 'Something Went Wrong.');

    }
    const setting = await settingService.getSettings();
    let attachments = [];

    if (files) {

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const type = f.type;
            const file = f.file;
            const host = f.host;
            const key = file.originalname.split(".")[0]

            const media = await mediaService.createMedia(file, type, host);

            if (formStates[key]) {
                formStates[key].fileType = type;
                formStates[key].defaultValue = media.src;
                formStates[key].src = {
                    _id: media._id,
                    src: media.src
                }

                const path = `${publicDir}/temp/${file.filename}`;
                const uploadPath = `${publicDir}/${type}`;
                const destPath = `${uploadPath}/${file.filename}`;

                // Check if the type-specific directory exists
                if (!fs.existsSync(uploadPath)) {
                    // Create the type-specific directory if it doesn't exist
                    fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
                        if (err) {
                            console.error('Error creating directory:', err);
                        }
                    });
                }

                fs.rename(path, destPath, function (err) {
                    if (err) throw err
                    console.log('Successfully renamed - AKA moved!')
                })

                attachments.push({ filename: file.originalname, path: destPath })

            }

        }


    }


    if (!form.recordOnly) {
        let from = form.setting['from'] || setting.email.from;
        let to = form.setting['to'] || setting.email.to;
        let cc = form.setting['cc'] || setting.email.cc;
        let bcc = form.setting['bcc'] || setting.email.bcc;
        let replyTo = form.setting['replyTo'] || setting.email.replyTo;
        let subject = form.setting['subject'] || setting.email.subject || "Untitled Email";

        if (from && to) {

            let transporter = nodemailer.createTransport({
                host: setting.email.host || 'localhost',
                port: setting.email.port || 1025,
                secure: setting.email.secure || false,
                ignoreTLS: setting.email.ignoreTLS || true,
                auth: setting.email.auth || {
                    "user": "",
                    "pass": ""
                }
            });



            const { html, body, head, footer, plain } = form.emailbody || {};

            const email = html == 1 ? `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          ${head}
        </head>
        <body>
        ${body}
        ${footer}
        </body>
        </html>` : plain;

            let compiledTemplate = handlebars.compile(email);
            let compiledSubject = handlebars.compile(subject ? subject : setting.email.subject);

            states['webTitle'] = setting.webTitle;
            states['tagLine'] = setting.tagLine;
            states['desc'] = setting.desc;
            states['author'] = setting.author;

            let content = compiledTemplate(states);
            subject = compiledSubject(states);


            if (form.setting?.sendCopy && isValidEmail(states['email'])) {
                to = to + "," + states['email'];
            }


            const info = await transporter.sendMail({
                from,
                to,
                subject,
                [html === 1 ? 'html' : 'text']: content,
                cc,
                bcc,
                replyTo,
                attachments
            });
        }
    }

    if (form.record || form.recordOnly) {
        const modelName = form.slug;
        const DocumentModel = Document(modelName)

        const uniqueId = uuidv4().substring(0, 6);

        console.log(formStates)


        const body = {
            name: form.name + " " + getCurrentDate(),
            slug: 'form' + `_${uniqueId}`,
            states: formStates
        }
        await DocumentModel.create(body)
    }

    if (files) {

        files.forEach(f => {
            const file = f.file;
            const path = `${publicDir}/temp/${file.filename}`;

            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        })

    }
    return;
};

module.exports = {
    getForms,
    duplicateForm,
    getForm,
    deleteForm,
    updateForm,
    publishForm,
    createForm,
    getCss,
    getElements,
    getStyle,
    updateElements,
    updateStyle,
    submit
}