const React = require('react');
const ReactDOMServer = require('react-dom/server');

const fsUtils = require('../../utils/fs-utils');
const he = require('he');
const path = require('path');
const fs = require('fs');

const JSZip = require("jszip");

const httpStatus = require('http-status')

const { generateElementsCss, getCurrentDate } = require('../../utils/utils');

const { getStateValue } = require('../../utils/element-value');
const documentService = require('./document.service');
const themeService = require('./theme.service');
const { Collection, Component, Document, Form, Layout, Page } = require('../models');

const ApiError = require('../../utils/api-error')


const dataDir = path.resolve(process.cwd(), 'private', 'data');
const publicDir = path.resolve(process.cwd(), 'public');



const getValue = (elem, value = '', states, props) => {
    const type = elem.type;
    const key = elem.key;

    switch (type) {
        case 'STATES':
            return getStateValue(key, states);
        case 'PROPS':
            return getStateValue(key, props);
        default:
            return value;
    }

}


/**
 * Create a setting
 * @param {Object} settingBody
 * @returns {Promise<Setting>}
 */
const saveSetting = async (settingBody) => {



    if (settingBody.scripts) {
        settingBody.scripts.head = he.decode(settingBody.scripts.head || '')
        settingBody.scripts.footer = he.decode(settingBody.scripts.footer || '')
    }


    await fsUtils.write(path.join(dataDir, 'setting.json'), JSON.stringify(settingBody, null, 4));
    return settingBody;
}


/**
 * Get a setting
 * @param
 * @returns {Promise<Setting>}
 */
const getSettings = async () => {
    const data = await fsUtils.read(path.join(dataDir, 'setting.json'));
    return JSON.parse(data || "{}");

}



/**
 * Get a page Css
 * @param {String} id
 * @returns {Promise<CSS>}
 */
const getCss = async (page) => {


    const projection = {
        styles: 1,
        elements: 1,
        components: 1,
        forms: 1,
        _id: 1
    };

    let css = [];
    if (!page) {
        return { css };
    }


    const elements = page.elements || {};

    css = [generateElementsCss(elements, page._id)];
    const styles = page.styles || {};
    css = [...css, generateElementsCss(styles, page._id)];
    const laoded = { [page._id]: true }


    const loadFormsCSS = async (forms) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form && !laoded[form._id]) {
                const elements = form.elements || {};

                css = [...css, generateElementsCss(elements, form._id)];
                let styles = form.styles || {};
                css = [...css, generateElementsCss(styles, form._id)];
                laoded[form._id] = true;
                const components = form.components || [];
                await loadComponentsCSS(components)
            }
        }
    }


    const loadComponentsCSS = async (components) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);
            if (component && !laoded[component._id]) {
                const elements = component.elements || {};

                css = [...css, generateElementsCss(elements, component._id)];
                let styles = component.styles || {};
                css = [...css, generateElementsCss(styles, component._id)];
                laoded[component._id] = true;

                const innerComponents = component.components || [];

                await loadComponentsCSS(innerComponents)
                const forms = component.forms || [];
                await loadFormsCSS(forms);
            }
        }
    }


    const components = page.components || [];
    await loadComponentsCSS(components);
    const forms = page.forms || [];
    await loadFormsCSS(forms);

    let layout = await Layout.findById(page.layout?.toString()).select("components")


    if (layout) {
        layout = layout.components;
        if (layout.top) {
            LayoutComponents[0] = (layout.top.toString())
        }
        if (layout.bottom) {
            LayoutComponents[1] = (layout.bottom.toString())
        }
        await loadComponentsCSS(LayoutComponents);

    }

    return { css }

};

/**
 * Get a page data
 * @param {String} id
 * @returns {Promise<Page>}
 */
const getPageData = async (id, type, withCss = true, document) => {

    // Define the fields to be returned
    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        relationships: 1,
        styles: 1,

        collStates: 1,
        events: 1,
        published: 1,


        attached: 1,
        type: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        url: 1,
        slug: 1,
        name: 1,
        _id: 1
    };


    const collections = [

        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',

            as: 'populatedRelationships',
            projection: { name: 1, slug: 1, _id: 1, }
        },

        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'setting.populatedImage',
            projection: { src: 1, alt: 1 }

        },
    ];

    let page = null;

    if (type === 'page')
        page = await Page.document(id, collections, projection);
    else if (type === 'collection')
        page = await Collection.document(id, collections, projection);
    else if (type === 'component')
        page = await Component.document(id, collections, projection);
    else if (type === 'form')
        page = await Form.document(id, collections, projection);

    // Initialize the pages object
    const pages = {}

    // Initialize the css array
    let css = [];
    // If page does not exist, return the pages object, layout object, states object and css array
    if (!page) {
        return { pages, layout: {}, states: {}, css };
    }


    // If withCss is true, generate the css for the page styles and add it to the css array
    if (withCss) {
        const styles = page.styles || {};
        css = [...css, generateElementsCss(styles, page._id)];
    }

    const settingData = {};

    const relationships = page.populatedRelationships.reduce((result, rel) => {
        result[rel._id] = rel.name;
        return result;
    }, {});

    if (document) {

        const relationships = [

            ...(page.populatedRelationships.map(rel => {
                const modelName = rel.slug.toLowerCase();
                return {
                    collectionName: modelName,
                    localField: `relationships.${rel._id}`,
                    foreignField: '_id',

                    as: `populatedRelationships.${rel._id}`,
                    projection: { name: 1, _id: 1 }
                }
            })),
            {
                collectionName: 'ac_medias',
                localField: 'setting.image',
                foreignField: '_id',
                as: 'setting.populatedImage',
                projection: { src: 1, alt: 1 }

            },
        ];



        const modelName = page.slug;
        const DocumentModel = Document(modelName)
        document = await DocumentModel.document(document._id, relationships, projection);

        if (document) {
            const proj = {
                name: 1,
                url: 1,
                slug: 1,
                setting: 1,
            };
            const nextDoc = await DocumentModel.
                findOne({ _id: { $gt: new ObjectId(document._id) }, 'setting.status': 'PUBLIC' }).sort({ _id: -1 })
                .select(proj).populate({
                    path: 'setting.image',
                    select: 'src alt'
                }).exec();
            const prevDoc = await DocumentModel.
                findOne({ _id: { $lt: new ObjectId(document._id) }, 'setting.status': 'PUBLIC' })
                .sort({ _id: 1 })
                .select(proj).populate({
                    path: 'setting.image',
                    select: 'src alt'
                }).exec();

            if (nextDoc)
                settingData.NEXTDOCUMNET = {
                    _id: nextDoc._id,
                    slug: nextDoc.slug,
                    name: nextDoc.name,
                    title: nextDoc.setting?.title,
                    image: nextDoc.setting?.image,
                    url: nextDoc.url,
                };

            if (prevDoc) {
                settingData.PREVDOCUMNET = {
                    _id: prevDoc._id,
                    slug: prevDoc.slug,
                    name: prevDoc.name,
                    title: prevDoc.setting?.title,
                    image: prevDoc.setting?.image,
                    url: prevDoc.url,
                };
            }
        }


    }
    // Add the page elements to the pages object
    pages[page._id] = {
        elements: page.elements || {},

        pageSetting: {
            _id: page._id,
            setting: document?.setting || page.setting,
            states: document?.states || page.states,
            name: document?.name || page.name,
            slug: document?.slug || page.slug,
            relationships: relationships,
            populatedRelationships: document.populatedRelationships,
            creator: document?.creator || page.creator,
            createdAt: document?.createdAt || page.createdAt,
            url: document?.url || page.url,
            ...settingData
        }

    }

    // Get the components of the page
    const components = page.components || [];


    // Function to get filters
    const getFilters = (filters, states, props) => {

        // Initialize the _filters array
        let _filters = [];

        // If filters does not exist, return the _filters array
        if (!filters)
            return _filters;

        // Map through filters and return an array of filter objects
        _filters = Object.values(filters).map(filter => {
            const type = filter.triggerType;
            const key = filter.triggerKey;
            const value = filter.defaultValue;

            // Get the default value based on the type and key
            let defaultValue = getValue({ type, key }, value, states, props);
            return { filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        })

        return _filters;

    }

    // Function to load documents based on the collection, states, and props
    const laodDocumnents = async (collection, _states, _props) => {

        let _id = collection._id;

        // If no id is provided, return the collection as is
        if (!_id)
            return collection;

        const docs = collection.docs || [];
        const states = collection.states || {};
        const setting = collection.setting || {};
        const withRelationship = collection.withRelationship || false;
        const selectedRelationships = collection.selectedRelationships || [];

        let documents = [];
        let maxPage = collection.maxPage || 0;

        // If docs is an array and has length greater than 0, get the document ids and fetch the documents
        if (Array.isArray(docs) && docs?.length > 0) {

            const docIds = docs.map(doc => doc._id);

            const res = await documentService.getFilteredDocuments(_id, { documentIds: docIds, withRelationship, selectedRelationships })

            documents = Array.isArray(res.documents) ? res.documents : [];
            maxPage = res.total;

        }
        // If docs is not an array or has length 0, get the filters and fetch all documents
        else {
            const filters = collection.filters || null;
            let sortBy = collection.sortBy || 'createdAt';
            let sort = collection.sort || 'acs';
            let limit = collection.limit || 10;
            let page = collection.page || 1;

            const computedFilters = getFilters(filters, _states, _props);

            const res = await documentService.getAllFilteredDocuments(_id,
                { filters: computedFilters, withRelationship, selectedRelationships },
                {},
                { page, limit, sortBy: sortBy + ":" + sort }
            )

            documents = Array.isArray(res.documents) ? res.documents : [];
            maxPage = res.total;
        }

        // Return the collection with the fetched documents, states, setting, and maxPage
        return { ...collection, documents, states, setting, maxPage }

    }

    // Function to load a collection based on the collection and projection
    const loadCollection = async (collection, projection = {
        states: 1,
        relationships: 1,
        setting: 1,
        name: 1,
        _id: 1
    }) => {
        if (collection) {

            const collections = [

                {
                    collectionName: 'ac_collections',
                    localField: 'relationships',
                    foreignField: '_id',

                    as: 'populatedRelationships',
                    projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 }
                },

            ];

            // Fetch the collection document and add it to the pages object
            const coll = await Collection.document(collection._id, collections, projection);
            if (coll) {
                pages[coll._id] = {
                    createdAt: coll.createdAt,
                    url: coll.url,
                    name: coll.name,

                    slug: coll.slug,

                    elements: coll.elements || {},
                    states: coll.states || {},
                    setting: coll.setting || {}
                }
            }

        }
    }

    // Function to load components based on the components and projection
    const loadComponents = async (components, projection) => {
        for (let i = 0; i < components.length; i++) {
            const component = await Component.findById(components[i]).select(projection);

            if (component && !pages[components[i]]) {

                pages[component._id] = {
                    elements: component.elements || {},
                    states: component.states || {},
                }

                if (withCss) {

                    let styles = component.styles || {};
                    css = [...css, generateElementsCss(styles, component._id)];
                }

                let parent = {};

                if (component.parent) {
                    const parentId = component.parent.toString();

                    if (!pages[parentId]) {
                        pages[parentId] = await Component.findById(parentId).select(projection);
                        parent = pages[parentId];
                    } else
                        parent = pages[parentId];
                }

                const collection = component.attached;

                if (collection) {


                    if (!pages[collection?.toString()])
                        await loadCollection(collection);
                    if (pages[collection]) {
                        const pageSetting = pages[collection].pageSetting;
                        if (pageSetting?.populatedRelationships
                            &&
                            component.collStates?.related) {


                            if (!component.collStates.filters)
                                component.collStates.filters = {};

                            for (let i = 0; i <= page.populatedRelationships?.length; i++) {
                                const rel = page.populatedRelationships[i];
                                if (rel) {
                                    component.collStates.filters[`__related_${i}__`] = {
                                        name: 'Related',
                                        type: 'RELATIONSHIPS',

                                        filterKey: [rel._id],
                                        defaultValue: pageSetting.populatedRelationships[rel._id] ? pageSetting.populatedRelationships[rel._id].map(v => v._id) : []

                                    }
                                }
                            }
                        }



                        let collStates = {
                            ...component.collStates,
                            _id: collection,
                            name: pageSetting?.name,
                            slug: pageSetting?.slug,
                            createdAt: pageSetting?.createdAt,
                            creator: pageSetting?.creator,
                            setting: pageSetting?.setting,
                            states: pageSetting?.states,

                        }
                        collStates = await laodDocumnents(collStates, component.states, parent?.states || {})
                        pages[component._id].collStates = collStates;

                    }
                }

                const innerComponents = component.components || [];
                await loadComponents(innerComponents, projection)

                const forms = component.forms || [];
                await loadForms(forms, projection)
            }
        }
    }


    const forms = page.forms || [];

    const loadForms = async (forms, projection) => {
        for (let i = 0; i < forms.length; i++) {
            const form = await Form.findById(forms[i]).select(projection);
            if (form && !pages[form[i]]) {

                pages[form._id] = {
                    elements: form.elements || {},
                    states: form.states || {},
                }

                if (withCss) {


                    const styles = form.styles || {};
                    css = [...css, generateElementsCss(styles, form._id)];
                }

                const innerComponents = form.components || [];

                await loadComponents(innerComponents, projection)

                const forms = form.forms || [];
                await loadComponents(forms, projection)

            }
        }
    }

    await loadForms(forms, projection)
    await loadComponents(components, projection);



    const LayoutComponents = [];

    if (page.type === 'component') {

        const collection = page.attached;

        if (collection) {
            let parent = {};
            if (page.parent) {

                const parentId = page.parent.toString();
                if (!pages[parentId]) {
                    pages[parentId] = await Component.findById(parentId).select(projection);
                    parent = pages[parentId];
                } else
                    parent = pages[parentId];
            }


            await loadCollection(collection);
            if (pages[collection]) {
                let collStates = {
                    ...page.collStates,
                    _id: collection,
                    setting: pages[collection].setting,
                    states: pages[collection].states
                }
                collStates = await laodDocumnents(collStates, page.states, parent?.states || {})
                pages[page._id].collStates = collStates;

            }
        }
    } else {
        let layout = await Layout.findById(page.layout?.toString()).select("components")


        if (layout) {
            layout = layout.components;
            if (layout.top) {
                LayoutComponents[0] = (layout.top.toString())
            }
            if (layout.bottom) {
                LayoutComponents[1] = (layout.bottom.toString())
            }
            await loadComponents(LayoutComponents, projection)

        }
    }

    return {
        css,
        pages,
        layout: { top: LayoutComponents[0], bottom: LayoutComponents[1] },
        states: page.states || {}

    };

}

const generatePages = async (_pages, pagesFolder, setting, fontCssString, AutoCode, AutocodeCustom) => {


    for (const page of _pages) {

        const pagesResults = await getPageData(
            page._id,
            page.type, true,
            null
        );
        //const style = await getCss(page);


        const settingData = {
            global: {
                title: setting.webtitle, tagline:
                    setting.tagline,
                desc: setting.desc,
                author: setting.author,
                images: setting.images
            }
        };



        const htmlString = AutoCode ? '' : ReactDOMServer.renderToString(<AutoCode
            _id={page._id}
            pages={pagesResults.pages}
            top={pagesResults.layout?.top}
            bottom={pagesResults.layout?.bottom}
            setting={settingData} states={pagesResults.states}
            type={page.type || 'page'}
            AutocodeCustom={AutocodeCustom}
        />);





        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${page.setting?.title ?
                page.setting.title :
                setting.webtitle ?
                    setting.webtitle : 'Page'}</title>
        <meta name="description" content="${page.setting?.desc ?
                page.setting.desc :
                setting.desc ?
                    setting.desc :
                    ''}" />

              <meta name="author" content="${setting.author}" />
              <meta name="keywords" content="${setting.keywords}" />
              <link rel="icon" href="${setting.images?.favicon?.src}" />
              <meta httpEquiv="Content-Language" content="${setting.lang}" />

            ${setting.scripts?.head}
            ${fontCssString}
            <link rel="stylesheet" href="../assets/style.css">
            <link rel="stylesheet" href="./assets/style.css">

          </head>
          <body>
            <div id="root">${htmlString}</div>
            ${setting.scripts ? setting.scripts.foot || '' : ''}
            ${page.setting ? page.setting.scripts?.foot || '' : ''}
            <script src="../static/index.js"></script>


          </body>
        </html>
      `;

        const assetsFolder = pagesFolder.folder("assets");
        assetsFolder.file('style.css', pagesResults.css.join(" "))
        pagesFolder.file((page.name) + '.html', html);

    }
}



/**
 * Download a Project
 * @param
 * @returns {Promise<download>}
 */
const download = async (query, res, AutoCode, AutocodeCustom) => {


    try {
        const { name, isPage, isComponent, isForm, isCollection, projectId } = query;

        const data = await fsUtils.read(path.join(dataDir, 'setting.json'));
        const setting = JSON.parse(data || "{}");

        if (!projectId || projectId !== setting._id) {
            return res.status(401).json({ message: 'Unauthorized' });

        }

        const zip = new JSZip();
        const pagesFolder = zip.folder("pages");
        const compsFolder = zip.folder("components");
        const formsFolder = zip.folder("forms");
        const collsFolder = zip.folder("collections");
        const staticFolder = zip.folder("assets");
        const rootFolder = zip.folder("");
        const assetsFolder = rootFolder.folder("public");

        const fonts = await themeService.getFonts(filter, options);
        const fontCssString = fonts.data.reduce((cssString, font) => {
            if (font.isGoogleFont && font.src) {
                // Google Fonts
                return cssString + `<style>${font.src}</style>`;
            } else if (Array.isArray(font.fontSrc)) {
                // Custom Fonts
                const fontSrcString = font.fontSrc
                    .map((src) => `url("${src.src}")`)
                    .join(',');

                return cssString + `
        <style>
          @font-face {
            font-family: "${font.fontFamily}";
            src: ${fontSrcString};
          }
        </style>
      `;
            }
            return cssString;
        }, '');

        if (Boolean(isPage == 'true')) {
            const pages = await Page.find({}).select("_id, type");
            await generatePages(pages,
                pagesFolder,
                setting,
                fontCssString,
                AutoCode,
                AutocodeCustom);
        }

        if (Boolean(isComponent == 'true')) {
            const pages = await Component.find({}).select("_id, type");
            await generatePages(pages,
                compsFolder,
                setting,
                fontCssString,
                AutoCode,
                AutocodeCustom);
        }

        if (Boolean(isForm == 'true')) {
            const pages = await Form.find({}).select("_id, type");
            await generatePages(pages,
                formsFolder,
                setting,
                fontCssString,
                AutoCode,
                AutocodeCustom);
        }

        if (Boolean(isCollection == 'true')) {
            const pages = await Collection.find({}).select("_id, type");
            await generatePages(pages,
                collsFolder,
                setting,
                fontCssString,
                AutoCode,
                AutocodeCustom);
        }

        const filter = {};
        const options = { limit: 100 };
        const colors = await themeService.getColors(filter, options);
        const variables = await themeService.getVariables(filter, options);

        const globalCss = await themeService.getCss();
        const rootCss = `html {
            ${fonts.data.reduce((cssString, variable) => {
            return cssString + variable.variable + ':' + variable.fontFamily + ";";
        }, '')}
      ${colors.data.reduce((cssString, color) => {
            return cssString + color.variable + ':' + color.color + ";";
        }, '')}
    ${variables.data.reduce((cssString, variable) => {
            return cssString + variable.variable + ':' + variable.value + ";";
        }, '')}
  }`;

        const jsCode = await themeService.getJs();


        staticFolder.file('style.css', rootCss + globalCss.css);
        staticFolder.file('index.js', jsCode.code);


        var destinationDir = path.join(publicDir, 'static');


        const addFilesToZip = (folderPath, folderName) => {
            const files = fs.readdirSync(folderPath);

            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                const stats = fs.statSync(filePath);

                if (stats.isFile()) {
                    const fileContent = fs.readFileSync(filePath);
                    assetsFolder.file(path.join(folderName, file), fileContent);
                } else if (stats.isDirectory()) {
                    const subFolderPath = path.join(folderPath, file);
                    const subFolderName = path.join(folderName, file);
                    addFilesToZip(subFolderPath, subFolderName);
                }
            });
        };

        addFilesToZip(destinationDir, "");



        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${name || setting.webtitle || 'theme'}-${getCurrentDate()}.zip`);

        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(res)
            .on('finish', () => {
                res.end();
            });
    } catch (e) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Some thing Wrong.', false, '');

    }

}




module.exports = {
    getSettings,
    saveSetting,
    download
}
