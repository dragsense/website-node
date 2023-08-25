const { Form, Document, Component, Collection,  } = require('../models');
const { generateCss, generateElementsCss, getCurrentDate } = require('../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const pluralize = require('pluralize');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const httpStatus = require('http-status')
const he = require('he');
import { settingService } from '.';

const ApiError = require('../../utils/api-error')


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
        forms: 1,
        states: 1,
        setting: 1,
        type: 1,
        _id: 1
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }


    const chunkStr = JSON.stringify(form._doc) + '\n';
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

                const chunkStr = JSON.stringify(form) + '\n';
                stream.push(chunkStr);

                laoded[form[i]] = true;

                const innerComponents = form.components || [];
                await loadComponents(innerComponents, projection)

                const forms = form.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component && !laoded[components[i]]) {
                laoded[components[i]] = true;

                const chunkStr = JSON.stringify(component._doc) + '\n';
                stream.push(chunkStr);

                const collection = component.attached;
                if(collection)
                await loadCollection(collection);

                const innerComponents = component.components || [];

                
                await loadComponents(innerComponents)

                const forms = component.forms || [];
                await loadForms(forms, projection)

            }
        }
    }

    const components = form.components || [];
    const forms = form.forms || [];

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
        _id: 1
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    if (Object.keys(form.styles).length > 0) {
        const chunkStr = JSON.stringify({ elements: form.styles, _id: form._id }) + '\n';
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
        elements: 1
    };


    const form = await Form.findById(id).select(projection);
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }
    let css = [];

    const elements = form.elements || {};

    css = [generateElementsCss(elements)];



    const styles = form.styles || {};



    css = [...css, generateElementsCss(styles)];

    const components = form.components || [];

    const loadComponentsCSS = async (components) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(id).select(projection);
            if (component) {
                let styles = component.styles || {};
                css = [...css, generateCss(styles)];
                const innerComponents = component.components || [];

                await loadComponentsCSS(innerComponents)
            }
        }
    }

    await loadComponentsCSS(components);

    return { css }

};



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
const submit = async (id, formBody) => {

    let { states } = formBody;

    const form = await Form.findById(id)
    if (!form) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
    }

    const formStates = form.states;
    let errorMessage = {};


    let isValid = true;
    Object.keys(states).forEach((key) => {
        const fieldData = states[key];
        const stateData = formStates[key];
        const regexString = stateData.regex;
        const regex = new RegExp(regexString);
        if ((stateData.required && !fieldData) || !regex.test(fieldData)) {
            stateData.error = 1;
            errorMessage[key] = stateData.errorMessage
            isValid = false;
        }
        else {
            stateData.error = 0;
            if (formStates[key])
                formStates[key].defaultValue = fieldData;
        }
    });

    if (!isValid)
        throw new ApiError(httpStatus[403], errorMessage || 'Something Went Wrong.');

    if (!form.recordOnly) {
        let from = form.setting['from'];
        let to = form.setting['to'];
        let cc = form.setting['cc'];
        let bcc = form.setting['bcc'];
        let replyTo = form.setting['replyTo'];
        let subject = form.setting['subject'];

        const setting = await settingService.getSettings();

        let transporter = nodemailer.createTransport({
            host: setting.email.host,
            port: setting.email.port,
            secure: setting.email.secure,
            ignoreTLS: true,
            //  auth: setting.email.auth
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

        let content = compiledTemplate(states);
        subject = compiledSubject(states);


        const info = await transporter.sendMail({
            from: from ? from : setting.email.from,
            to: to ? to : setting.email.to,
            subject: subject ? subject : setting.email.subject,
            [html == 1 ? 'html' : 'text']: content,
            cc: cc ? cc : setting.email.cc,
            bcc: bcc ? bcc : setting.email.bcc,
            replyTo: replyTo ? replyTo : setting.email.replyTo
        });
    }

    if (form.record || form.recordOnly) {
        const modelName = form.slug;
        const DocumentModel = Document(modelName)

        const uniqueId = uuidv4().substring(0, 6);

        const body = {
            name: form.name + " " + getCurrentDate(),
            slug: 'form' + `_${uniqueId}`,
            states: formStates
        }
        await DocumentModel.create(body)
    }

    return;
};

module.exports = {
    getForms,
    duplicateForm,
    getForm,
    deleteForm,
    updateForm,
    createForm,
    getCss,
    getElements,
    getStyle,
    updateElements,
    updateStyle,
    submit
}