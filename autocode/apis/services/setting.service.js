const React = require('react')
const ReactDOMServer = require('react-dom/server')

const fsUtils = require('../../utils/fs-utils')
const he = require('he')
const path = require('path')
const fs = require('fs')

const JSZip = require('jszip')

const httpStatus = require('http-status')

const { generateElementsCss, getCurrentDate } = require('../../utils/utils')

const { getStateValue } = require('../../utils/element-value')
const documentService = require('./document.service')
const themeService = require('./theme.service')
const { Collection, Component, Document, Form, Layout, Page } = require('../models')

const ApiError = require('../../utils/api-error')

const dataDir = path.resolve(process.cwd(), 'private', 'data')
const publicDir = path.resolve(process.cwd(), 'public')

const { ObjectId } = require('mongodb')
const shortid = require('shortid')
const { default: mongoose } = require('mongoose')

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

    await fsUtils.write(path.join(dataDir, 'setting.json'), JSON.stringify(settingBody, null, 4))
    return settingBody
}

/**
 * Get a setting
 * @param
 * @returns {Promise<Setting>}
 */
const getSettings = async () => {
    const data = await fsUtils.read(path.join(dataDir, 'setting.json'))
    return JSON.parse(data || '{}')
}

/**
 * Get a page data
 * @param {String} id
 * @returns {Promise<Array>}
 */
const getPageData = async (id, type, host, withCss = false, remainingSlug) => {
    // Define the fields to be returned
    const projection = {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        relationships: 1,
        styles: 1,
        parent: 1,
        collStates: 1,
        events: 1,
        published: 1,
        attached: 1,
        type: 1,
        layout: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        url: 1,
        slug: 1,
        name: 1,
        _id: 1,
    }

    const collections = [
        ...getCollectionsToPopulate(),
        {
            collectionName: 'ac_layouts',
            localField: 'layout',
            foreignField: '_id',
            as: 'populatedLayout',
            projection: { ...projection, main: 1 },
        },
    ]
    try {
        let page = null
        if (type === 'collection') page = await Collection.document(id, collections, projection)
        else if (type === 'component') page = await Component.document(id, collections, projection)
        else if (type === 'form') page = await Form.document(id, collections, projection)
        else if (type === 'layout') page = await Layout.document(id, collections, projection)
        else page = await Page.document(id, collections, projection)

        // Initialize the pages object
        const pages = {}

        // Initialize the css array
        let style = { css: [] }
        // If page does not exist, return the pages object, layout object, states object and css array
        if (!page) {
            return { pages, layout: {}, states: {}, css }
        }

        // If withCss is true, generate the css for the page styles and add it to the css array
        if (withCss) {
            const styles = page.styles || {}
            style.css = [...style.css, generateElementsCss(styles, page._id)]
        }

        let settingData = {}

        // Reduce the populatedRelationships to a relationships object
        const relationships = page.populatedRelationships?.reduce((result, rel) => {
            result[rel._id] = rel.name
            return result
        }, {})

        // Function to populate a document with its relationships and setting data
        const populateDocument = async (page, document, projection) => {
            const relationships = [
                ...page.populatedRelationships.map((rel) => {
                    const modelName = rel.slug.toLowerCase()
                    return {
                        collectionName: modelName,
                        localField: `relationships.${rel._id}`,
                        foreignField: '_id',

                        as: `populatedRelationships.${rel._id}`,
                        projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 },
                    }
                }),
                {
                    collectionName: 'ac_medias',
                    localField: 'setting.image',
                    foreignField: '_id',
                    as: 'setting.populatedImage',
                    projection: { src: 1, alt: 1 },
                },
            ]

            const modelName = page.slug
            const DocumentModel = Document(modelName)
            return await DocumentModel.document(document._id, relationships, projection)
        }

        // Function to get an adjacent document (next or previous)
        const getAdjacentDocument = async (page, document, proj, condition, sortDirection) => {
            const DocumentModel = Document(page.slug)
            return await DocumentModel.findOne({ _id: condition, 'setting.status': 'PUBLIC' })
                .sort({ _id: sortDirection })
                .select(proj)
                .populate({
                    path: 'setting.image',
                    select: 'src alt',
                })
                .exec()
        }

        // Function to get setting data for a document
        const getSettingData = async (page, document) => {
            const proj = {
                name: 1,
                url: 1,
                slug: 1,
                setting: 1,
            }
            const nextDoc = await getAdjacentDocument(page, document, proj, { $gt: new ObjectId(document._id) }, -1)
            const prevDoc = await getAdjacentDocument(page, document, proj, { $lt: new ObjectId(document._id) }, 1)

            let settingData = {}
            if (nextDoc)
                settingData.NEXTDOCUMNET = {
                    _id: nextDoc._id,
                    slug: nextDoc.slug,
                    name: nextDoc.name,
                    title: nextDoc.setting?.title,
                    image: nextDoc.setting?.image,
                    url: nextDoc.url,
                }

            if (prevDoc) {
                settingData.PREVDOCUMNET = {
                    _id: prevDoc._id,
                    slug: prevDoc.slug,
                    name: prevDoc.name,
                    title: prevDoc.setting?.title,
                    image: prevDoc.setting?.image,
                    url: prevDoc.url,
                }
            }
            return settingData
        }

        let document = null

        if (remainingSlug) {
            const modelName = page.slug
            const DocumentModel = Document(modelName)
            document = await DocumentModel.findOne({ slug: remainingSlug, 'setting.status': 'PUBLIC' }).select({
                _id: 1,
                slug: 1,
            })
        }

        let populatedRelationships = page.populatedRelationships

        // If document exists, populate the document with its relationships and setting data
        if (document) {
            document = await populateDocument(page, document, projection)
            if (document) {
                settingData = await getSettingData(page, document)
                populatedRelationships = document.populatedRelationships
                page.setting = document.setting
                page.states = document.states
                page.name = document.name
                page.slug = document.slug
                page.creator = document.creator
                page.createdAt = document.createdAt
                page.url = document.url
            }
        }

        if (Array.isArray(populatedRelationships))
            populatedRelationships = populatedRelationships.reduce((acc, collection) => {
                acc[collection._id] = [collection]
                return acc
            }, {})

        // Add the page elements to the pages object

        // Get the components of the page
        const components = page.components || []

        // Function to get default value based on type and key
        const getDefaultValue = (type, key, states, props, value) => {
            switch (type) {
                case 'STATES':
                    return getStateValue(key, states, host)
                case 'PROPS':
                    return getStateValue(key, props, host)
                default:
                    return value
            }
        }

        // Function to create filter object
        const createFilterObject = (filter, states, props) => {
            const type = filter.triggerType
            const key = filter.triggerKey
            const value = filter.defaultValue

            // Get the default value based on the type and key
            let defaultValue = getDefaultValue(type, key, states, props, value)
            return { filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        }

        // Function to get filters
        const getFilters = (filters, states, props) => {
            // Initialize the _filters array
            let _filters = []

            // If filters does not exist, return the _filters array
            if (!filters) return _filters

            // Map through filters and return an array of filter objects
            _filters = Object.values(filters).map((filter) => createFilterObject(filter, states, props))

            return _filters
        }

        // Function to fetch documents based on provided document ids
        const fetchDocumentsByIds = async (_id, docs, withRelationship, selectedRelationships) => {
            const docIds = docs.map((doc) => doc._id)
            const res = await documentService.getFilteredDocuments(_id, {
                documentIds: docIds,
                withRelationship,
                selectedRelationships,
            })
            return res
        }

        // Function to fetch all documents based on filters
        const fetchAllDocuments = async (
            _id,
            filters,
            _states,
            _props,
            withRelationship,
            selectedRelationships,
            sortBy,
            sort,
            limit,
            page
        ) => {
            const computedFilters = getFilters(filters, _states, _props)
            const res = await documentService.getAllFilteredDocuments(
                _id,
                { filters: computedFilters, withRelationship, selectedRelationships },
                {},
                { page, limit, sortBy: sortBy + ':' + sort }
            )
            return res
        }

        // Function to load documents based on the collection, states, and props
        const loadDocuments = async (collection, _states, _props) => {
            let _id = collection._id

            // If no id is provided, return the collection as is
            if (!_id) return collection

            const docs = collection.docs || []
            const states = collection.states || {}
            const setting = collection.setting || {}
            const withRelationship = collection.withRelationship || false
            const selectedRelationships = collection.selectedRelationships || []

            let documents = []
            let maxPage = collection.maxPage || 0

            // If docs is an array and has length greater than 0, get the document ids and fetch the documents
            if (Array.isArray(docs) && docs?.length > 0) {
                const res = await fetchDocumentsByIds(_id, docs, withRelationship, selectedRelationships)
                documents = Array.isArray(res.documents) ? res.documents : []
                maxPage = res.total
            }
            // If docs is not an array or has length 0, get the filters and fetch all documents
            else {
                const filters = collection.filters || null
                let sortBy = collection.sortBy || 'createdAt'
                let sort = collection.sort || 'asc'
                let limit = collection.limit || 10
                let page = collection.page || 1

                const res = await fetchAllDocuments(
                    _id,
                    filters,
                    _states,
                    _props,
                    withRelationship,
                    selectedRelationships,
                    sortBy,
                    sort,
                    limit,
                    page
                )
                documents = Array.isArray(res.documents) ? res.documents : []
                maxPage = res.total
            }

            // Return the collection with the fetched documents, states, setting, and maxPage
            return { ...collection, documents, states, setting, maxPage }
        }

        // Function to load a collection based on the collection and projection
        const loadCollection = async (
            collection,
            projection = {
                states: 1,
                relationships: 1,
                setting: 1,
                type: 1,
                name: 1,
                _id: 1,
            }
        ) => {
            if (collection) {
                // Define the collections to be populated
                const collections = [
                    {
                        collectionName: 'ac_collections',
                        localField: 'relationships',
                        foreignField: '_id',
                        as: 'populatedRelationships',
                        projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 },
                    },
                ]

                // Fetch the collection document
                const coll = await Collection.document(collection._id, collections, projection)
                if (coll) {
                    // Add the fetched collection to the pages object
                    pages[coll._id] = {
                        createdAt: coll.createdAt,
                        url: coll.url,
                        name: coll.name,
                        slug: coll.slug,
                        type: coll.type,
                        elements: coll.elements || {},
                        states: coll.states || {},
                        setting: coll.setting || {},
                    }
                }
            }
        }

        // Function to load components based on the components and projection
        const loadComponents = async (components, projection) => {
            // Use Promise.all to load all components concurrently for better performance
            await Promise.all(
                components.map(async (componentId) => {
                    const component = await Component.findById(componentId).select(projection)

                    // If component exists and not already loaded
                    if (component && !pages[componentId]) {
                        await loadSingleComponent(component, projection)
                    }
                })
            )
        }

        // Function to load a single component
        const loadSingleComponent = async (component, projection) => {
            pages[component._id] = {
                elements: component.elements || {},
                states: component.states || {},
                events: component.events || {},

                type: component.type || 'component',
            }

            if (withCss) {
                let styles = component.styles || {}
                style.css = [...style.css, generateElementsCss(styles, component._id)]
            }

            let parent = await getParent(component, projection)

            if (component.attached) {
                await handleAttachedComponent(component, parent, projection)
            }

            const innerComponents = component.components || []
            await loadComponents(innerComponents, projection)

            const forms = component.forms || []
            await loadForms(forms, projection)
        }

        // Function to get parent of a component
        const getParent = async (component, projection) => {
            let parent = {}
            if (component.parent) {
                const parentId = component.parent.toString()
                if (!pages[parentId]) {
                    pages[parentId] = await Component.findById(parentId).select(projection)
                }
                parent = pages[parentId]
            }
            return parent
        }

        // Function to handle attached component
        const handleAttachedComponent = async (component, parent, projection) => {
            const collection = component.attached
            if (!pages[collection?.toString()]) {
                await loadCollection(collection)
            }
            if (pages[collection]) {
                const pageSetting = pages[collection].pageSetting
                if (pageSetting?.populatedRelationships && component.collStates?.related) {
                    await handleRelatedComponent(component, pageSetting.populatedRelationships)
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
                collStates = await loadDocuments(collStates, component.states, parent?.states || {})
                pages[component._id].collStates = collStates
            }
        }

        // Function to handle related component
        const handleRelatedComponent = async (component, populatedRelationships) => {
            if (!component.collStates.filters) {
                component.collStates.filters = {}
            }
            for (let i = 0; i <= page.populatedRelationships?.length; i++) {
                const rel = page.populatedRelationships[i]

                if (rel) {
                    component.collStates.filters[`__related_${i}__`] = {
                        name: 'Related',
                        type: 'RELATIONSHIPS',
                        filterKey: [rel._id],
                        defaultValue: populatedRelationships[rel._id]
                            ? populatedRelationships[rel._id].map((v) => v._id)
                            : [],
                    }
                }
            }
        }

        const forms = page.forms || []
        // Function to load a single form
        const loadSingleForm = async (formId, projection) => {
            // Fetch the form by its id
            const form = await Form.findById(formId).select(projection)
            // If form exists and not already loaded
            if (form && !pages[formId]) {
                // Add the form elements and states to the pages object
                pages[form._id] = {
                    elements: form.elements || {},
                    states: form.states || {},
                    type: form.type || 'form',
                    setting: form.setting || {},
                }
                // If withCss is true, generate the css for the form styles and add it to the css array
                if (withCss) {
                    const styles = form.styles || {}
                    style.css = [...style.css, generateElementsCss(styles, form._id)]
                }
                // Load the components of the form
                const innerComponents = form.components || []
                await loadComponents(innerComponents, projection)
            }
        }

        // Function to load forms based on the forms and projection
        const loadForms = async (forms, projection) => {
            // Use Promise.all to load all forms concurrently for better performance
            await Promise.all(
                forms.map(async (formId) => {
                    await loadSingleForm(formId, projection)
                })
            )
        }

        // Load forms and components concurrently for better performance
        await Promise.all([loadForms(forms, projection), loadComponents(components, projection)])

        // Initialize layout components
        const layout = page.populatedLayout?.[0]
        const LayoutComponents = []

        const mainPageData = {
            pageSetting: {
                _id: page._id,
                setting: page.setting,
                states: page.states,
                name: page.name,
                slug: page.slug,
                relationships: relationships,
                populatedRelationships,
                creator: page.creator,
                createdAt: page.createdAt,
                url: page.url,
                host,
                ...settingData,
            },
        }

        const pageElements = page.elements || {
            0: {
                _uid: '0',
                tagName: 'div',
                type: 'layout',
                layout: 'root',
                nodeValue: '',
                childNodes: [],
            },
        }

        // Check if layout exists
        if (layout) {
            if (withCss) {
                const styles = layout.styles || {}
                style.css = [...style.css, generateElementsCss(styles, layout._id)]
            }

            const components = layout.components || []
            const forms = layout.forms || []

            // Load layout components
            await Promise.all([loadForms(forms, projection), loadComponents(components, projection)])

            const layoutElements = layout.elements || {
                0: {
                    _uid: '0',
                    tagName: 'div',
                    type: 'layout',
                    layout: 'root',
                    nodeValue: '',
                    childNodes: [],
                },
            }

            if (layoutElements[layout.main]) {
                layoutElements[layout.main].childNodes.push('main')
            } else {
                layoutElements['0'].childNodes.push('main')
            }

            pageElements['main'] = { ...pageElements['0'] }
            delete pageElements['0']

            pages[page._id] = {
                elements: { ...layoutElements, ...pageElements },
                ...mainPageData,
            }
        } else {
            pages[page._id] = {
                elements: pageElements,
                ...mainPageData,
            }
        }

        // Return the css, pages, layout and states

        return {
            ...style,
            pages,
        }
    } catch (error) {
        // Log the error and rethrow it
        console.error('An unexpected error occurred:', error)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred')
    }
}

const generatePages = async (_pages, pagesFolder, setting, AutoCode, AutocodeCustom) => {
    // Iterate over each page
    for (const page of _pages) {
        // Fetch page data
        const pagesResults = await getPageData(page._id, page.type, '../public', true, null)

        // Prepare setting data
        const settingData = prepareSettingData(setting)

        // Generate HTML string
        const htmlString = generateHTMLString(AutoCode, page, pagesResults, settingData, AutocodeCustom)

        // Generate HTML
        const html = generateHTML(page, setting, htmlString, '../public')

        // Write CSS and HTML to files
        writeFilesToFolder(pagesFolder, pagesResults, page, html)
    }
}

// Function to prepare setting data
const prepareSettingData = (setting) => {
    return {
        global: {
            title: setting.webtitle,
            tagline: setting.tagline,
            desc: setting.desc,
            author: setting.author,
            images: setting.images,
        },
    }
}

// Function to generate HTML string
const generateHTMLString = (AutoCode, page, pagesResults, settingData, AutocodeCustom) => {
    return AutoCode === undefined
        ? ''
        : ReactDOMServer.renderToString(
              <AutoCode
                  _id={page._id}
                  pages={pagesResults.pages}
                  top={pagesResults.layout?.top}
                  bottom={pagesResults.layout?.bottom}
                  setting={settingData}
                  states={pagesResults.states}
                  type={page.type || 'page'}
                  AutocodeCustom={AutocodeCustom}
              />
          )
}

// Function to generate HTML
const generateHTML = (page, setting, htmlString, host) => {
    return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${page.setting?.title ? page.setting.title : setting.webTitle ? setting.webTitle : 'Page'}${
        setting.tagLine ? ' - ' + setting.tagLine : ''
    }</title>
            <meta name="description" content="${
                page.setting?.desc ? page.setting.desc : setting.desc ? setting.desc : ''
            }" />
            <meta name="author" content="${setting.author}" />
            <meta name="keywords" content="${setting.keywords}" />
            <link rel="icon" href="${host}${setting.images?.favicon?.src || `/images/default/favicon.ico`}" />
            <meta httpEquiv="Content-Language" content="${setting.lang}" />
            <link rel="stylesheet" href="../public/autocode-custom-index.css">
            <link rel="stylesheet" href="./styles/${page.name}.css">
            ${setting.scripts?.head}
            ${page.scripts ? page.scripts?.head || '' : ''}

          </head>
          <body>
            <div id="root">${htmlString}</div>
            ${setting.scripts ? setting.scripts.foot || '' : ''}
           ${page.scripts ? page.scripts?.footer || '' : ''}
            <script src="../public/autocode-custom-style.js"></script>
          </body>
        </html>
    `
}

// Function to write CSS and HTML to files
const writeFilesToFolder = (pagesFolder, pagesResults, page, html) => {
    const assetsFolder = pagesFolder.folder('styles')
    assetsFolder.file(`${page.name}.css`, pagesResults.css.join(' '))
    pagesFolder.file(page.name + '.html', html)
}

/**
 * Download a Project
 * @param
 * @returns {Promise<download>}
 */
const download = async (query, res, host, AutoCode, AutocodeCustom) => {
    try {
        // Destructure the query parameters
        const { name, isPage, isComponent, isForm, isCollection, projectId } = query


        // Read the setting.json file
        const data = await fsUtils.read(path.join(dataDir, 'setting.json'))
        const setting = JSON.parse(data || '{}')

        // Check if projectId is valid
        if (!projectId || projectId !== setting._id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        // Create a new zip file
        const zip = new JSZip()

        // Create folders in the zip file
        const pagesFolder = zip.folder('pages')
        const compsFolder = zip.folder('components')
        const formsFolder = zip.folder('forms')
        const collsFolder = zip.folder('collections')
        const publicFolder = zip.folder('public')

        // Generate pages, components, forms and collections based on the query parameters
        if (Boolean(isPage == 'true')) {
            await generateEntities(Page, pagesFolder, setting, AutoCode, AutocodeCustom)
        }

        if (Boolean(isComponent == 'true')) {
            await generateEntities(Component, compsFolder, setting, AutoCode, AutocodeCustom)
        }

        if (Boolean(isForm == 'true')) {
            await generateEntities(Form, formsFolder, setting, AutoCode, AutocodeCustom)
        }

        if (Boolean(isCollection == 'true')) {
            await generateEntities(Collection, collsFolder, setting, AutoCode, AutocodeCustom)
        }

        // Define filter and options for fetching fonts, colors and variables
        const filter = {}
        const options = { limit: 100 }

        // Fetch colors and variables
        const colors = await themeService.getColors(filter, options)
        const variables = await themeService.getVariables(filter, options)

        // Fetch fonts and generate font CSS string
        const fonts = await themeService.getFonts(filter, options)
        const fontCssString = generateFontCssString(fonts)

        // Generate global CSS
        const globalCss = await themeService.getCss()
        const rootCss = generateRootCss(fonts, colors, variables)

        // Fetch JS code
        const jsCode = await themeService.getJs()

        // Add CSS and JS files to the zip
        publicFolder.file('autocode-custom-style.css', rootCss + fontCssString + globalCss.css)
        publicFolder.file('autocode-custom-index.js', jsCode.code)

        // Define the destination directory
        //var destinationDir = path.join(publicDir, 'static');

        // Add files to the zip
        //addFilesToZip(publicDir, '', assetsFolder)

        // Set headers and send the zip file
        res.setHeader('Content-Type', 'application/zip')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${name || setting.webTitle || 'theme'}-${getCurrentDate()}.zip`
        )

        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(res)
            .on('finish', () => {
                res.end()
            })
    } catch (e) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Some thing Wrong.', false, '')
    }
}

// Function to generate font CSS string
const generateFontCssString = (fonts) => {
    return fonts.data.reduce((cssString, font) => {
        if (font.isGoogleFont && font.src) {
            // Google Fonts
            return `${cssString}${font.src}`
        } else if (Array.isArray(font.fontSrc) && font.fontSrc?.length > 0) {
            // Custom Fonts
            const fontSrcString = font.fontSrc
                .map((src) => {
                    let url = new URL(src.src)
                    return `url("${url.pathname}")`
                })
                .join(',')

            return `${cssString}
                <style>
                @font-face {
                font-family: "${font.fontFamily}";
                src: ${fontSrcString};
                }
                </style>`
        }
        return cssString
    }, '')
}

// Function to generate entities (pages, components, forms, collections)
const generateEntities = async (Entity, folder, setting, fontCssString, AutoCode, AutocodeCustom) => {
    const entities = await Entity.find({}).select('name _id slug type')
    await generatePages(entities, folder, setting, fontCssString, AutoCode, AutocodeCustom)
}

// Function to generate root CSS
const generateRootCss = (fonts, colors, variables) => {
    return `html {
        ${fonts.data.reduce((cssString, variable) => {
            return cssString + variable.variable + ':' + variable.fontFamily + ';'
        }, '')}
  ${colors.data.reduce((cssString, color) => {
      return cssString + color.variable + ':' + color.color + ';'
  }, '')}
${variables.data.reduce((cssString, variable) => {
    return cssString + variable.variable + ':' + variable.value + ';'
}, '')}
}`
}

// Function to add files to the zip
const addFilesToZip = (folderPath, folderName, assetsFolder) => {
    const files = fs.readdirSync(folderPath)

    files.forEach((file) => {
        const filePath = path.join(folderPath, file)
        const stats = fs.statSync(filePath)

        if (stats.isFile()) {
            const fileContent = fs.readFileSync(filePath)
            assetsFolder.file(path.join(folderName, file), fileContent)
        } else if (stats.isDirectory()) {
            const subFolderPath = path.join(folderPath, file)
            const subFolderName = path.join(folderName, file)
            addFilesToZip(subFolderPath, subFolderName, assetsFolder)
        }
    })
}

const defaultElement = (page, name, type) => {
    let id = shortid.generate()
    const className = `ac-elem-${type}-root-${id}`
    let styleUid = shortid.generate()
    const styles = {
        [styleUid]: {
            _uid: styleUid,
            selectorText: `.${className}`,
            type: 'div',
            style: {},
        },
    }

    page['styles'] = styles
    page['_styles'] = styles

    const elements = {
        0: {
            _uid: '0',
            tagName: 'div',
            type: 'layout',
            name: name,
            layout: 'root',
            nodeValue: '',
            childNodes: [],
            selector: `.${className}`,
            className,
            styleUid,
        },
    }

    page['elements'] = elements
    page['_elements'] = elements
}

/**
 * Get a page Elements
 * @param {String} id
 * @returns {Promise<any>}
 */
const getElements = async (id, stream, type, host) => {
    // Define the fields to be returned
    const projection = getProjection()

    // Define the collections to be populated
    const collections = getCollectionsToPopulate()

    // Fetch the collection by id, populate the defined collections and return the defined fields

    const Model =
        type === 'collection'
            ? Collection
            : type === 'component'
            ? Component
            : type === 'form'
            ? Form
            : type === 'layout'
            ? Layout
            : Page

    let page = await Model.document(id, collections, projection)

    // If the collection does not exist, throw an error
    if (!page) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Elements not found')
    }

    // Check if the elements array is empty or doesn't have a 0th element
    if (!page['elements'] || !page['elements'][0]) {
        defaultElement(page, type + ' Root Element', type)

        // Use findOneAndUpdate to update the existing document
        await Model.findOneAndUpdate({ _id: page._id }, page, { new: true })
    }

    // Prepare the document to be sent to the client
    const doc = prepareDocument(page)

    doc.host = host

    if (page.parent) {
        const parent = await Component.findById(page.parent).select({ states: 1 })
        doc.props = parent.states
    }

    // Convert the document to a string and push it to the stream
    const chunkStr = JSON.stringify(doc) + '\n'

    stream.push(chunkStr)

    // Initialize an object to keep track of loaded collections
    const loaded = { [doc._id]: true }

    // Load the forms and components of the document
    const components = doc.components || []
    const forms = doc.forms || []

    const collection = page.attached

    if (collection) await loadCollection(collection, projection, loaded, stream)

    await loadComponents(components, projection, loaded, stream)
    await loadForms(forms, projection, loaded, stream)

    stream.push(null)
}

// Function to define the fields to be returned
const getProjection = () => {
    return {
        elements: 1,
        components: 1,
        forms: 1,
        states: 1,
        relationships: 1,
        collStates: 1,
        events: 1,
        _collStates: 1,
        published: 1,
        _forms: 1,
        _elements: 1,
        _components: 1,
        _states: 1,
        _events: 1,
        attached: 1,
        parent: 1,
        type: 1,
        setting: 1,
        createdAt: 1,
        creator: 1,
        url: 1,
        slug: 1,
        name: 1,
        _id: 1,
        main: 1,
    }
}

// Function to define the collections to be populated
const getCollectionsToPopulate = () => {
    return [
        {
            collectionName: 'ac_collections',
            localField: 'relationships',
            foreignField: '_id',
            as: 'populatedRelationships',
            projection: { name: 1, url: 1, createdAt: 1, creator: 1, slug: 1, _id: 1, states: 1, setting: 1 },
        },
        {
            collectionName: 'ac_medias',
            localField: 'setting.image',
            foreignField: '_id',
            as: 'setting.populatedImage',
            projection: { src: 1, _id: 1, alt: 1 },
        },
    ]
}

// Function to prepare the document to be sent to the client
const prepareDocument = (collection) => {
    const doc = {
        type: collection.type,
        createdAt: collection.createdAt,
        creator: collection.creator,
        setting: collection.setting,
        populatedRelationships: collection.populatedRelationships,
        name: collection.name,
        slug: collection.slug,
        url: collection.url,
        _id: collection._id,
        attached: collection.attached,
        parent: collection.parent,
        main: collection.main,
    }
    if (!collection.published) {
        doc.elements = collection._elements
        doc.components = collection._components
        doc.forms = collection._forms
        doc.states = collection._states
        doc.collStates = collection._collStates
        doc.events = collection._events
    } else {
        doc.elements = collection.elements
        doc.components = collection.components
        doc.forms = collection.forms
        doc.states = collection.states
        doc.collStates = collection.collStates
        doc.events = collection.events
    }
    return doc
}

// Function to load the components of a document
const loadComponents = async (components, projection, loaded, stream) => {
    for (let i = 0; i < components.length; i++) {
        const component = await Component.findById(components[i]).select(projection)
        if (component && !loaded[components[i]]) {
            loaded[components[i]] = true
            const doc = prepareDocument(component)
            const chunkStr = JSON.stringify(doc) + '\n'
            stream.push(chunkStr)
            const collection = component.attached
            if (collection) await loadCollection(collection, projection, loaded, stream)
            const innerComponents = doc.components || []
            await loadComponents(innerComponents, projection, loaded, stream)
        }
    }
}

// Function to load the forms of a document
const loadForms = async (forms, projection, loaded, stream) => {
    for (let i = 0; i < forms.length; i++) {
        const form = await Form.findById(forms[i]).select(projection)
        if (form && !loaded[forms[i]]) {
            loaded[forms[i]] = true
            const doc = prepareDocument(form)
            const chunkStr = JSON.stringify(doc) + '\n'
            stream.push(chunkStr)
            const innerComponents = doc.components || []
            await loadComponents(innerComponents, projection, loaded, stream)
        }
    }
}

// Function to load a collection
const loadCollection = async (collectionId, projection, loaded, stream) => {
    if (collectionId && !loaded[collectionId]) {
        loaded[collectionId] = true
        const collections = getCollectionsToPopulate()
        const collection = await Collection.document(collectionId, collections, projection)
        if (collection) {
            const chunkStr = JSON.stringify(collection) + '\n'
            stream.push(chunkStr)
        }
    }
}

/**
 * Get a collection Css
 * @param {String} id
 * @returns {Promise<CSS>}
 */
const getCss = async (id, type, host) => {
    // Define the fields to be returned
    const projection = {
        styles: 1,
        components: 1,
        forms: 1,
        _id: 1,
        _forms: 1,
        _components: 1,
        _styles: 1,
        published: 1,
    }

    let style = { css: [] }

    let page = null
    if (type === 'collection') page = await Collection.findById(id).select(projection)
    else if (type === 'component') page = await Component.findById(id).select(projection)
    else if (type === 'form') page = await Form.findById(id).select(projection)
    else if (type === 'layout') page = await Layout.findById(id).select(projection)
    else page = await Page.findById(id).select(projection)

    if (!page) {
        return { css }
    }

    // Prepare the document object
    const doc = prepareDocument(page)

    if (!page.published) {
        doc.styles = page._styles
    } else doc.styles = page.styles

    // Generate CSS for the styles
    style.css = generateCssForStyles(doc, style.css, host)

    // Load CSS for forms
    await loadFormsCSS(doc.forms || [], projection, style)

    // Load CSS for components
    await loadComponentsCSS(doc.components || [], projection, style)

    return style
}

// Function to generate CSS for the styles
const generateCssForStyles = (doc, css, host) => {
    const styles = doc.styles || {}

    return [...css, generateElementsCss(styles, doc._id, host)]
}

// Function to load CSS for forms
const loadFormsCSS = async (forms, projection, style, host) => {
    for (let i = 0; i < forms.length; i++) {
        const form = await Form.findById(forms[i]).select(projection)
        if (form) {
            const doc = prepareDocument(form)

            if (!form.published) {
                doc.styles = form._styles
            } else doc.styles = form.styles

            style.css = generateCssForStyles(doc, style.css, host)
            await loadComponentsCSS(doc.components, projection, style, host)
        }
    }
}

// Function to load CSS for components
const loadComponentsCSS = async (components, projection, style, host) => {
    for (let i = 0; i < components.length; i++) {
        const component = await Component.findById(components[i]).select(projection)
        if (component) {
            const doc = prepareDocument(component)

            if (!component.published) {
                doc.styles = component._styles
            } else doc.styles = component.styles

            style.css = generateCssForStyles(doc, style.css, host)

            await loadComponentsCSS(doc.components, projection, style, host)
            await loadFormsCSS(doc.forms, projection, style, host)
        }
    }
}

/**
 * Get a page
 * @param {String} id
 * @param {String} type
 * @returns {Promise<any>}
 */
const getPage = async (field, value, type = 'page') => {
    const projection = {
        _id: 1,
        type: 1,
        setting: 1,
        slug: 1,
        scripts: 1,
    }

    const Model =
        type === 'collection'
            ? Collection
            : type === 'component'
            ? Component
            : type === 'form'
            ? Form
            : type === 'layout'
            ? Layout
            : Page

    let page = await Model.findOne({ [field]: value, 'setting.status': 'PUBLIC' }).select(projection)

    return page;
}

module.exports = {
    getSettings,
    saveSetting,
    getPageData,
    getPage,
    download,
    getElements,
    getCss,
}

