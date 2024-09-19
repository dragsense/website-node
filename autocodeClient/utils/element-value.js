import { formatDate } from './utils'
import { Parser } from 'expr-eval'
const parser = new Parser()

/**
 * Get the value of a state based on its key.
 * This function is used to retrieve the value of a state from a given states object.
 * It uses the key array to navigate through the nested states object.
 *
 * @param {string[]} key - The key to access the state.
 * @param {object} states - The states object.
 * @returns {any} - The value of the state.
 */
export const getStateValue = (key, states, host) => {
    try {
        // If states object is not provided, return an empty string
        if (!states) {
            return ''
        }

        // Get the reference to the state using the first element of the key array
        const stateRef = states[key[0]]

        // If the state reference is not found, return an empty string
        if (!stateRef) {
            return ''
        }

        // Depending on the type of the state, return the appropriate value
        switch (stateRef.type) {
            case 'image':
                return {
                    value: stateRef.src ? host + stateRef.src.src : './images/default/default-img.png',
                    label: stateRef.src?.alt || 'image',
                }

            case 'video':
                return {
                    value: stateRef.src ? host + stateRef.src.src : './images/default/default-poster.png',
                    label: stateRef.src?.alt || 'video',
                    srcs: stateRef.srcs,
                }

            case 'audio':
                return {
                    value: './audios/default/sample.mp3',
                    srcs: stateRef.srcs,
                }

            case 'images':
                if (key[1] && stateRef.states) {
                    const index = isNaN(Number(key[1])) ? -1 : Number(key[1])
                    if (stateRef.states[index] !== undefined) {
                        const value = stateRef.states[index]
                        return {
                            value: value.src || './images/default/default-img.png',
                            label: value.alt || 'image',
                        }
                    }
                }
                return ''

            case 'array':
                if (key[1] && stateRef.states) {
                    const index = isNaN(Number(key[1])) ? -1 : Number(key[1])
                    if (stateRef.states[index] !== undefined) {
                        const value = stateRef.states[index].value?.split(':')
                        return {
                            value: value[0],
                            label: value[1] || value[0],
                        }
                    }
                }
                return ''

            case 'object':
                return getStateValue([key[1]], stateRef.states)

            default:
                return stateRef.defaultValue !== undefined ? stateRef.defaultValue : ''
        }
    } catch (e) {
        // If an error occurs, display an error message and return an empty string
        console.error('Something went wrong.')
        return ''
    }
}

/**
 * Get values from states based on a key.
 * This function is used to retrieve an array of values from a given states object.
 * It uses the key array to navigate through the nested states object.
 *
 * @param {string[]} key - The key to access the states.
 * @param {object} states - The states object.
 * @returns {Array} - An array of values.
 */
export const getStateStates = (key, states, host) => {
    let values = []

    try {
        // If states object is not provided, return an empty array
        if (!states) {
            return values
        }

        // Get the value from the states object using the first element of the key array
        const value = states[key[0]]

        // If the value is not found, return an empty array
        if (!value) {
            return values
        }

        // Depending on the type of the value, populate the values array
        if (value.type === 'array') {
            values = Object.values(value.states || {}).flatMap((state) => {
                const val = state.value.split(':')
                return { label: val[0], value: val[1] || state.idx, key: val[1] || state.id }
            })
        }

        if (value.type === 'images') {
            values = Object.values(value.states || {}).map((state) => {
                return { label: state.alt, value: host + state.src, key: state._id }
            })
        }

        // Add other conditions here for different state types if needed.
    } catch (e) {
        // If an error occurs, display an error message
        console.error('Something went wrong, ' + e?.message)
    }

    // Return the values array
    return values
}

/**
 * Get a state reference based on a key.
 * This function is used to retrieve a reference to a state from a given states object.
 * It uses the key array to navigate through the nested states object.
 *
 * @param {string[]} key - The key to access the state.
 * @param {object} states - The states object.
 * @returns {any} - The state reference or undefined if not found.
 */
export const getStateRef = (key, states) => {
    // If states object is not provided, return undefined
    if (!states) {
        return undefined
    }

    // Get the value from the states object using the first element of the key array
    let value = states[key[0]]

    // If the value is not found, return undefined
    if (!value) {
        return undefined
    }

    // If the state type is 'array' or 'images', return undefined.
    if (value.type === 'array' || value.type === 'images') {
        return undefined
    }

    // If the state type is 'object' and it has 'states', access the nested state.
    if (value.type === 'object' && value.states) {
        value = value.states[key[1]]
    }

    // Return the value
    return value
}

/**
 * Get the default value for a given state key.
 * This function is used to retrieve the default value of a state from a given states object.
 * It uses the key array to navigate through the nested states object.
 *
 * @param {string[]} key - The key to access the state.
 * @param {object} states - The states object.
 * @returns {any} - The default value based on the state type.
 */
export const getStates = (key, states) => {
    try {
        // If states object is not provided, return an empty string
        if (!states) {
            return ''
        }

        // Get the reference to the state using the first element of the key array
        const stateRef = states[key[0]]

        // If the state reference is not found, return an empty string
        if (!stateRef) {
            return ''
        }

        // Depending on the type of the state, return the appropriate default value
        switch (stateRef.type) {
            // Handle image type
            case 'image':
                const imageSrc = stateRef.src?.src || './images/default/default-img.png'
                const imageLabel = stateRef.src?.alt || 'image'
                return {
                    value: imageSrc,
                    label: imageLabel,
                }

            // Handle video type
            case 'video':
                const videoSrc = stateRef.src?.src || './images/default/default-poster.png'
                const videoLabel = stateRef.src?.alt || 'video'
                return {
                    value: videoSrc,
                    label: videoLabel,
                    srcs: stateRef.srcs,
                }

            // Handle audio type
            case 'audio':
                return {
                    value: './audios/default/sample.mp3',
                    srcs: stateRef.srcs,
                }

            // Handle images type
            case 'images':
                if (stateRef.states && key[1]) {
                    const index = isNaN(Number(key[1])) ? -1 : Number(key[1])
                    if (stateRef.states[index] !== undefined) {
                        const value = stateRef.states[index]
                        return {
                            value: value.src || './images/default/default-img.png',
                            label: value.alt || 'image',
                        }
                    }
                } else if (stateRef.states) {
                    return Object.values(stateRef.states).map((value) => ({
                        label: value.alt,
                        value: value.src,
                        key: value._id,
                    }))
                }
                return ''

            // Handle array type
            case 'array':
                if (stateRef.states && key[1]) {
                    const index = isNaN(Number(key[1])) ? -1 : Number(key[1])
                    if (stateRef.states[index] !== undefined) {
                        const value = stateRef.states[index].value?.split(':')
                        return {
                            value: value[0],
                            label: value[1] || value[0],
                        }
                    }
                } else if (stateRef.states) {
                    return Object.values(stateRef.states).flatMap((value, index) => {
                        const val = value.value.split(':')
                        return {
                            label: val[0],
                            value: val[1] || value.idx,
                            key: val[1] || value.id,
                        }
                    })
                }
                return ''

            // Handle object type
            case 'object':
                return getStateValue([key[1]], stateRef.states)

            // Handle default case
            default:
                return stateRef.defaultValue !== undefined ? stateRef.defaultValue : ''
        }
    } catch (e) {
        console.error('Something went wrong.', e?.message)
        return ''
    }
}

/**
 * Update the value of a state based on provided parameters.
 * This function uses the eval function to evaluate the expression.
 * It's important to ensure that the expression is safe to evaluate.
 *
 * @param {object} elem - The element containing key and value expressions.
 * @param {string} withValue - The value to substitute for '[withkey]' in expressions.
 * @param {object} states - The states object.
 * @param {any} value - The value to update the state with.
 * @param {string} updateKey - The key to update in the state (default is 'defaultValue').
 * @returns {boolean} - True if the update was successful, false otherwise.
 */
export const updateStateValue = (elem, withValue, states, value, updateKey = 'defaultValue') => {
    const key = elem.key
    const expression = elem.value

    let stateRef = getStateRef(key, states)
    if (!stateRef) {
        return false
    }

    try {
        let updatedValue = ''

        if (expression) {
            let originalExpression = expression.replace(/\[withkey]/g, withValue)
            originalExpression = originalExpression.replace(/\[value]/g, value)
            originalExpression = originalExpression.replace(/\[key]/g, stateRef[updateKey])

            const expr = parser.parse(originalExpression)
            updatedValue = expr.evaluate()
        } else {
            updatedValue = value
        }

        // Ensure the updated value is within the min and max limits.
        if (updatedValue >= stateRef.max && updateKey !== 'max') {
            updatedValue = stateRef.max
        } else if (updatedValue <= stateRef.min && updateKey !== 'min') {
            updatedValue = stateRef.min
        }

        // Update the state with the new value.
        stateRef[updateKey] = updatedValue
        return true
    } catch (e) {
        console.error(e.message)
        return false
    }
}

/**
 * Generate a cascading menu structure based on element states.
 * This function maps over the element states and generates a cascading menu structure.
 * It creates a new array with the transformed states and returns it.
 *
 * @param {object} elementStates - The states of elements.
 * @param {string} type - The type for the root item.
 * @param {string} value - The value for the root item.
 * @returns {Array} - An array representing the cascading menu structure.
 */
export const generateCascader = (elementStates, type, value) => {
    // Map over the element states and transform each state into a cascader item
    const cascaderItems = Object.values(elementStates).map((state) => {
        let children = null

        // If the state has nested states, map over them and transform each into a cascader item
        if (state.states) {
            state.type = state.type || 'array'
            children = Object.keys(state.states).map((key) => ({
                label: key.toUpperCase(),
                value: key,
            }))
        }

        // Return the transformed state as a cascader item
        return {
            label: state.key.toUpperCase(),
            value: state.key,
            type: state.type,
            children,
        }
    })

    // Return the cascader structure with the root item
    return [{ label: type, value, type, children: cascaderItems }]
}

/**
 * Generate a cascading menu structure for collection states.
 * This function maps over the collection states and generates a cascading menu structure.
 * It creates a new array with the transformed states and returns it.
 *
 * @param {object} elementStates - The collection states.
 * @param {string} type - The type for the root item.
 * @param {string} value - The value for the root item.
 * @returns {Array} - An array representing the cascading menu structure.
 */
export const generateCascaderCollStates = (elementStates, type, value) => {
    // Map over the collection states and transform each state into a cascader item
    const cascaderItems = Object.entries(elementStates).map(([key, value]) => {
        // If the key is 'states', generate a cascader for it
        if (key === 'states') {
            return generateCascader(value, 'STATES', key)[0]
        }

        // Create a cascader item for the state
        const cascaderItem = {
            label: key.toUpperCase(),
            value: key,
            type: key === 'documents' ? 'array' : undefined,
            children: null,
        }

        // Return the cascader item
        return cascaderItem
    })

    // Return the cascader structure with the root item
    return [{ label: type, value, type, children: cascaderItems }]
}

// Define the default document structure
export const defaultDoc = [
    { label: '_ID', value: '_id' },
    { label: 'NAME', value: 'name' },
    {
        label: 'SLUG',
        value: 'slug',
    },
    {
        label: 'URL',
        value: 'url',
    },
    {
        label: 'TITLE',
        value: 'title',
    },
    {
        label: 'DESC',
        value: 'desc',
    },
    {
        label: 'EXCERPT',
        value: 'excerpt',
    },
    {
        label: 'IMAGE',
        value: 'image',
    },
]

// Define the page settings structure
export const pageSetting = [
    { label: '_ID', value: '_id' },
    { label: 'NAME', value: 'name' },
    {
        label: 'SLUG',
        value: 'slug',
    },
    {
        label: 'CREATOR',
        value: 'creator',
        children: [
          {
            label: "NAME",
            value: "name",
          },
          {
            label: "EMAIL",
            value: "email",
          },
          {
            label: "BIO",
            value: "bio",
          },
          {
            label: "Image",
            value: "image",
          },
        ],
    },
    {
        label: 'URL',
        value: 'url',
    },
    {
        label: 'CREATED AT',
        value: 'createdAt',
        children: [
            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
            { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
            { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
            { label: 'Month D, YYYY', value: 'MMMM D, YYYY' },
            { label: 'D MMM, YYYY', value: 'D MMM, YYYY' },
            { label: 'MMMM DD, YYYY', value: 'MMMM DD, YYYY' },
            { label: 'DD MMM, YYYY', value: 'DD MMM, YYYY' },
        ],
    },
    {
        label: 'SETTING',
        value: 'SETTING',
        children: [
            {
                label: 'TITLE',
                value: 'title',
            },
            {
                label: 'DESC',
                value: 'desc',
            },
            {
                label: 'EXCERPT',
                value: 'excerpt',
            },
            {
                label: 'CONTENT',
                value: 'content',
            },
            {
                label: 'IMAGE',
                value: 'image',
            },
            {
                label: 'STATUS',
                value: 'status',
            },
        ],
    },
]

/**
 * Generate cascading relations states for a collection.
 * This function maps over the populated relationships of the collection and generates a cascading menu structure.
 * It creates a new array with the transformed states and returns it.
 *
 * @param {object} collection - The collection object containing relationships.
 * @returns {Array} - An array representing the cascading relations states.
 */
export const generateCascadeRelationsStates = async (collection) => {
    let cascaderItems = []
    let relationsStates = []

    if (collection.populatedRelationships) {
        // Map over the populated relationships and generate a cascader for each
        cascaderItems = await Promise.all(
            collection.populatedRelationships.map(async (relation) => {
                return generateCascader(relation.states || {}, relation.name.toUpperCase(), relation._id)[0]
            })
        )

        // Construct the relations states with the cascader items
        relationsStates = [
            {
                label: 'POPULATED',
                value: 'POPULATED',
                children: cascaderItems,
            },
            {
                type: 'array',
                label: 'RELATIONSHIPS',
                value: 'RELATIONSHIPS',
                children: collection.populatedRelationships.map((rel) => ({
                    label: rel.name.toUpperCase(),
                    value: rel._id,
                    type: 'relations',
                })),
            },
            {
                type: 'array',
                label: 'PAGES',
                value: 'PAGES',
                children: [{ label: 'INDEX', value: 'index' }],
            },
        ]
    }

    return relationsStates
}

/**
 * Get a range of page numbers for pagination.
 * This function calculates a range of page numbers based on the current page, total pages, and pagination configuration.
 * It returns an array of page numbers and ellipsis.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalPages - The total number of pages.
 * @param {object} pagination - Pagination configuration.
 * @returns {Array} - An array of page numbers and ellipsis.
 */
export const getPaginationRange = (currentPage, totalPages, pagination) => {
    const leftRangeLength = Math.min(pagination.leftRange || 1, totalPages)
    const rightRangeLength = Math.min(pagination.rightRange || 1, totalPages)
    const rangeSize = pagination.nearRange || 2
    const dots = pagination.dots || '...'

    let start = Math.max(currentPage - rangeSize, leftRangeLength + 1)
    let end = Math.min(currentPage + rangeSize, totalPages - rightRangeLength)

    // Handle case where leftRange + rightRange >= totalPages
    if (leftRangeLength + rightRangeLength + rangeSize * 2 >= totalPages) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const leftRange = Array.from({ length: leftRangeLength }, (_, index) => index + 1)
    const rightRange = Array.from({ length: rightRangeLength }, (_, index) => totalPages - rightRangeLength + index + 1)

    // Nearby pages range
    const nearbyRange = Array.from({ length: end - start + 1 }, (_, index) => start + index)

    // Adjust for dots
    if (start > leftRangeLength + 1) {
        leftRange.push(dots)
    } else {
        start = leftRangeLength + 1
    }

    if (end < totalPages - rightRangeLength) {
        rightRange.unshift(dots)
    } else {
        end = totalPages - rightRangeLength
    }

    // Combine ranges without duplication
    return [...new Set([...leftRange, ...nearbyRange, ...rightRange])]
}

/**
 * Retrieve a value from a nested object based on a key array.
 * This function traverses the settings object using the key array and fetches the corresponding value.
 * It handles different types of keys and returns the appropriate value.
 *
 * @param {Array} key - The key array to access the value.
 * @param {object} setting - The settings object.
 * @returns {object|null} - The value based on the key or null if not found.
 */
export const getSettingValue = (key, setting, host) => {
    // Extract the setting object
    const _setting = setting.setting
    // If the setting object is not defined, return null
    if (!_setting) return null

    // If the key is 'image', return the image source and alt text
    if (key[1] === 'image') {
        const image = _setting['populatedImage']
        return {
            value: host + image?.src || '/images/default/default-img.png',
            label: image?.alt || '',
        }
    }

    // If the key is 'status', return the status value and label
    if (key[1] === 'status') {
        const status = _setting[key[1]]
        return {
            value: status,
            label: status || '',
        }
    }

    // For other keys, return the value and label from the setting object
    return {
        value: key[1] === 'content' ? key[1] : _setting[key[1]],
        label: _setting[key[1]] || ``,
    }
}

/**
 * Retrieve a value from a document based on a key array.
 * This function fetches the corresponding value from the document using the key array.
 *
 * @param {Array} key - The key array to access the value.
 * @param {object} setting - The settings object.
 * @returns {object|null} - The value based on the key or null if not found.
 */
const getDocumentValue = (key, setting) => {
    // Extract the document object
    const doc = setting[key[0]]
    // If the document object is not defined, return null
    if (!doc) {
        return null
    }

    // If the key is 'image', return the image source and alt text
    if (key[1] === 'image') {
        const image = doc['image']
        return {
            value: image?.src || '/images/default/default-img.png',
            label: image?.alt || 'Featured Image',
        }
    }

    // For other keys, return the value and label from the document object
    return {
        value: doc[key[1]],
        label: doc[key[1]] || ``,
    }
}

/**
 * Get a value from a nested object based on a key array.
 * This function navigates through the settings object using the key array and returns the corresponding value.
 * It handles different types of keys and returns the appropriate value.
 *
 * @param {Array} key - The key array to access the value.
 * @param {object} setting - The settings object.
 * @returns {object|null} - The value based on the key or null if not found.
 */
export const getPageValue = (elemKey, setting, host, mapIndex = 0) => {
    // Remove 'POPULATED' if it's the first element in the key array

    const key = [...elemKey]
    if (key[0] === 'POPULATED') {
        key.shift()
        if (setting.populatedRelationships?.[key[0]]) {
            const populated = setting.populatedRelationships[key[0]][mapIndex] || {}
            key.shift()
            return getPageValue([...key], populated, host)
        }
    }

    if (key[0] === 'states' || key[0] === 'STATES') {
        const modifiedKey = [...key]
        modifiedKey.shift()
        return getStateValue(modifiedKey, setting.states, setting.host || host)
    } else if (key[0] === 'RELATIONSHIPS' && setting.relationships) {
        return setting.relationships[key[1]] || null
    } else if (key[0] === 'SETTING') {
        return getSettingValue(key, setting, setting.host || host)
    } else if (key[0] === 'creator' && key[1]) {
        const creator = setting[key[0]] || {}
        const value = creator[key[1]]
        return {
            value: key[1] !== 'email' ? key[1] : value,
            label: value || 'Unknown',
        }
    } else if (key[0] === 'createdAt') {
        const createdAt = setting[key[0]]
        return createdAt ? formatDate(createdAt, key[1]) : ``
    } else if (key[1] === 'NEXTDOCUMNET' || key[1] === 'PREVDOCUMNET') {
        return getDocumentValue(key, setting)
    } else {
        return {
            value: setting[key[0]] !== undefined ? setting[key[0]] : ``,
            label: setting[key[0]] || ``,
        }
    }
}

/**
 * Get an array of page states based on documents and a type.
 * This function maps over the documents and transforms each document into a page state object.
 * If no documents are provided, it returns an array with a single default page state object.
 *
 * @param {Array} documents - The array of documents.
 * @param {string} pageType - The type for the page states.
 * @returns {Array} - An array of page states objects.
 */
export const getPageStates = (documents, pageType) => {
    // If documents array is not empty, map over it and create page states
    if (documents?.length > 0) {
        return documents.map((document) => ({
            type: pageType,
            label: document.name,
            value: document._id,
            key: document._id,
            ...document,
            setting: document.setting,
        }))
    }

    // If documents array is empty, return an array with a default page state
    return [
        {
            label: '[Relation]',
            value: '',
        },
    ]
}
