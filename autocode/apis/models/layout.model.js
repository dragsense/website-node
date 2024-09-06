const mongoose = require('mongoose')
const shortid = require('shortid');

const { toJSON, document, paginate } = require('./plugins')
const Schema = mongoose.Schema

const LayoutSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        main: {
            type: String,
            required: true,
            default: '0'
        },
        elements: {
            type: Object,
            default: {
                0: {
                    _uid: '0',
                    tagName: 'div',
                    type: 'layout',
                    layout: 'root',
                    name: 'Layout Root Element',
                    nodeValue: '',
                    childNodes: [],
                },
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
            default: {},
        },
        _styles: {
            type: Object,
            default: {},
        },
        published: {
            type: Boolean,
            default: true,
        },
        styles: {
            type: Object,
            default: {},
        },
        duplicated: {
            type: Boolean,
            default: false,
        },
        updater: {
            type: Object,
            default: {},
        },
        creator: {
            type: Object,
            default: {},
        },
        withTemplate: {
            type: String,
            default: 'noSides',
        },
    },
    { timestamps: true }
)

LayoutSchema.pre('save', async function (next) {
    const page = this

    // If the page is new and not duplicated, generate unique identifiers and set up styles
    if (page.isNew && !page.duplicated) {
        setupNewPage(page)
    }

    next()
})


/**
 * Setup new page with unique identifiers and styles
 * @param {Object} page - The page object
 */
function setupNewPage(page) {
    let id = shortid.generate()
    const className = `ac-elem-layout-root-${id}`
    page.elements['0'].className = className
    page.elements['0'].selector = `.${className}`
    let styleUid = shortid.generate()
    page.elements['0'].styleUid = styleUid

    page.styles = {
        [styleUid]: {
            _uid: styleUid,
            selectorText: `.${className}`,
            type: 'div',
            style: {},
        },
    }

     if (page.withTemplate) {
         setupTemplate(page, styleUid, page.withTemplate);
     } else page.main = '0'

     delete page.withTemplate;
}

/**
 * Sets up the page with child elements and grid layout if using a template
 * @param {Object} page - The page object
 * @param {String} styleUid - The root element's unique style UID
 */
function setupTemplate(page, styleUid, withTemplate) {
    const includeLeft = withTemplate !== 'noLeft' && withTemplate !== 'noSides';
    const includeRight = withTemplate !== 'noRight' && withTemplate !== 'noSides';

    // Define child elements based on template options
    page.elements['0'].childNodes = ['1']; // Always include Header
    let nextElementId = 2;

    if (includeLeft) {
        page.elements['0'].childNodes.push(nextElementId.toString()); // Add Left Aside
        nextElementId++;
    }

    page.elements['0'].childNodes.push(nextElementId.toString()); // Add Main
    const mainElementId = nextElementId;
    nextElementId++;

    if (includeRight) {
        page.elements['0'].childNodes.push(nextElementId.toString()); // Add Right Aside
        nextElementId++;
    }

    page.elements['0'].childNodes.push(nextElementId.toString()); // Add Footer

    // Map for assigning specific part of the class names, tag names, and element names
    const childClassNames = {
        1: 'header',
        [mainElementId]: 'main',
        [nextElementId]: 'footer',
    };

    const tagNames = {
        1: 'header',
        [mainElementId]: 'main',
        [nextElementId]: 'footer',
    };

    const names = {
        1: 'Header',
        [mainElementId]: 'Main',
        [nextElementId]: 'Footer',
    };

    if (includeLeft) {
        childClassNames[2] = 'left-aside';
        tagNames[2] = 'aside';
        names[2] = 'Left Aside';
    }
    if (includeRight) {
        childClassNames[nextElementId - 1] = 'right-aside';
        tagNames[nextElementId - 1] = 'aside';
        names[nextElementId - 1] = 'Right Aside';
    }

    // Create child elements with unique class names, tag names, and element names
    for (const i of page.elements['0'].childNodes) {
        const id = shortid.generate();
        const childClassName = `ac-element-${childClassNames[i]}-${id}`; // e.g., ac-element-header-xxxx

        page.elements[i] = {
            _uid: i,
            tagName: tagNames[i], // e.g., 'header', 'main', 'footer', 'aside'
            type: 'layout',
            className: childClassName,
            selector: `.${childClassName}`, // .ac-element-header-xxxx, etc.
            childNodes: [],
            styleUid: shortid.generate(),
            name: names[i], // e.g., 'Header', 'Main', 'Footer', 'Left Aside', 'Right Aside'
        };

        // Add basic grid areas for each child element
        page.styles[page.elements[i].styleUid] = {
            _uid: page.elements[i].styleUid,
            selectorText: `.${childClassName}`, // .ac-element-header-xxxx, etc.
            type: tagNames[i],
            style: {
                normal: {
                    root: {
                        properties: {
                            'grid-area': {
                                value: childClassNames[i],
                                unit: '',
                            },
                        },
                    },
                },
            },
        };
    }

    // Define grid areas based on the template
    let gridTemplateAreas = `
        "header header header"
        "${includeLeft ? 'left-aside' : 'main'} main ${includeRight ? 'right-aside' : 'main'}"
        "footer footer footer"
    `;

    // Add grid style to the main/root element (element '0')
    page.styles[styleUid].style = {
        normal: {
            root: {
                properties: {
                    display: {
                        value: 'grid',
                        unit: '',
                    },
                    'grid-template-areas': {
                        value: gridTemplateAreas.trim(),
                        unit: '',
                    },
                    'grid-template-columns': {
                        value: includeLeft && includeRight ? '1fr 3fr 1fr' : includeLeft || includeRight ? '1fr 3fr 1fr' : '1fr 2fr 1fr',
                        unit: '',
                    },
                    'grid-template-rows': {
                        value: 'auto',
                        unit: '',
                    },
                },
            },
        },
        '(min-width: 768px) and (orientation: landscape)': {
            root: {
                properties: {
                    'grid-template-areas': {
                        value: gridTemplateAreas.trim(),
                        unit: '',
                    },
                    'grid-template-columns': {
                        value: includeLeft && includeRight ? '1fr 3fr 1fr' : includeLeft || includeRight ? '1fr 3fr 1fr' : '1fr 2fr 1fr',
                        unit: '',
                    },
                },
            },
        },
    };

    // Set the main content area to the appropriate element
    page.main = mainElementId.toString();
}



LayoutSchema.plugin(paginate)
LayoutSchema.plugin(document)

const Layout = mongoose.model('AC_Layout', LayoutSchema)

module.exports = Layout
