

import React, { useMemo } from "react";

import { getStateValue, getPageValue } from '../../utils/element-value';
import ElementValue from './ElementValue';
import { evaluate } from "mathjs";
/**
 * This is a React functional component called ElementSetting.
 * It renders an ElementValue component with certain props.
 * 
 * @param {object} props - The props object containing the following properties:
 *   - conditions: An object representing the conditions for rendering the component.
 *   - attributes: An object representing the attributes of the component.
 *   - mapValue: The value used for mapping.
 *   - mapIndex: The index used for mapping.
 *   - colStates: The column states.
 *   - setting: The setting object.
 *   - _states: The states object.
 *   - _cstates: The column states object.
 *   - _props: The props object.
 *   - classes: An object representing the classes of the component.
 *   - children: The children of the component.
 *   - node: The node object.
 * 
 * @returns {JSX.Element} The rendered ElementValue component.
 */
const ElementSetting = (props) => {
    // Destructure the props object
    const {
        conditions,
        attributes,
        mapValue,
        mapIndex,
        colStates,
        setting,
        _states,
        _cstates,
        _props,
        classes,
        children,
        node
    } = props;

    /**
     * This function is used to get the value of an element.
     * 
     * @param {object} elem - The element object.
     * @param {string} value - The default value.
     * @returns {any} The value of the element.
     */
    const getValue = (elem, value = '') => {
        // Get the type and key of the element
        const type = elem?.type;
        const key = elem?.key;

        // Check the type of the element and return the corresponding value
        switch (type) {
            case 'GLOBAL':
                return handleGlobalType(key, value);
            case 'PROPS':
                return getStateValue(key, _props, setting?.host) || `[props.${key}]`;
            case 'STATES':
                return getStateValue(key, _states, setting?.host);
            case 'PAGE':

                return getPageValue(key, setting, setting?.host, mapIndex);
            case 'COLSTATES':
                return handleColStatesType(key, value, setting?.host);
            case 'FORMSTATES':
                return handleFormStatesType(key);
            case 'MAPVALUE':
                return mapValue;
            case 'MAPINDEX':
                return mapIndex;
            default:
                return handleDefaultType(type, key);
        }
    };

    // Handle 'GLOBAL' type
    const handleGlobalType = (key, value) => {
        if (key[0] === "WINDOW") {
            return handleWindowType(key);
        } else if (key[0] === "WEBSITE") {
            return handleWebsiteType(key);
        }
        return value;
    };
   // Handle 'WINDOW' type
   const handleWindowType = (key) => {

    if(typeof window === 'undefined')
    return;

    if (key[1] === 'width') {
        return window.innerWidth;
    } else if (key[1] === 'height') {
        return window.innerHeight;
    }
};

    // Handle 'WEBSITE' type
    const handleWebsiteType = (key) => {
        const global = setting.global || [];
        if (key[1] === 'images') {
            return handleImagesType(key, global);
        }
        return {
            value: global[key[1]],
            label: global[key[1]] || ``
        };
    };

    // Handle 'images' type
    const handleImagesType = (key, global) => {
        const images = global[key[1]] || {};
        const image = images[key[2]] || {};
        return {
            value: image?.src ? setting?.host +image.src : '/images/default/default-img.png',
            label: image === undefined ? `image` : image?.alt || "image"
        };
    };

    // Handle 'COLSTATES' type
    const handleColStatesType = (key, value, host) => {
        if (!colStates) return value;
        if (key[0] === 'PAGES') return mapIndex + 1;
        else if (key[0] === 'docsLength' && colStates.documents) return colStates.documents.length || '0';
        else return getPageValue(key, colStates, host, mapIndex);
    };

    // Handle 'FORMSTATES' type
    const handleFormStatesType = (key) => {
        if (_states && _states[key[0]]) {
            const val = _states[key[0]][key[1]];
            return val !== undefined ? val :  "''";
        }
        
    };

    const handleDefaultType = (type, key) => {
        
        const cstateId = _cstates?._uid;
        let types = ['Menu', 'Flex', 'Tabs', 'Accordion', 'Sider', 'Grid', 'Container', 'Slider', 'Gallery', 'Dropdown', 'Observable', 'Modal', 'GoToTop'];
        types = types.map(t => t+ "-" +cstateId);
        if (types.includes(type)) {
            return getStateValue(key, _cstates);
        }
        return '';
    };

    /**
     * This function is used to evaluate the condition expression.
     * 
     * @param {string} expression - The condition expression.
     * @param {string} v - The state value.
     * @param {string} keyValue - The key value.
     * @returns {boolean} The result of the condition evaluation.
     */
    const evaluateCondition = (expression, v, keyValue) => {
        let original = expression.replace(/\[state]/g, v);
        original = original.replace(/\[key]/g, keyValue);
        try {
            return !!evaluate(`${original}`);
        } catch (e) {
            console.error("Invalid expression:" + e?.message);
            return true;
        }
    };



    /**
     * This function is used to calculate the conditions for rendering the component.
     * 
     * @param {object} conditions - The conditions object.
     * @returns {boolean} The result of the conditions evaluation.
     */
    const calculateConditions = (conditions) => {
        if (!conditions || !node._uid) return true;
        return Object.values(conditions).reduce((prev, condition) => {
            const value = getValue(condition);
            const keyValue = value?.value !== undefined ? value.value : value;
            const stateValue = getValue(condition.valueState, '');
            const v = stateValue?.value !== undefined ? stateValue.value : stateValue;
            let cond = true;
            if (condition.value) {
                cond = evaluateCondition(condition.value, v, keyValue);
            }
            const result = condition.relation == 'AND' ? prev && cond : prev || cond;
            return result;
        }, true);
    };

    /**
     * This function is used to calculate the attribute value.
     * 
     * @param {object} attribute - The attribute object.
     * @returns {any} The calculated attribute value.
     */
    const calculateAttributeValue = (attribute) => {
        let attributeValue = null;
        if (attribute.key === 'style') {
            attributeValue = calculateAttributes(attribute.attributes);
        } else {
            const stateValue = getValue(attribute.valueState, attribute.value);
            let value = stateValue?.value || stateValue;

            if (typeof attribute.value === 'string' && attribute.value) {
                value = attribute.value.replace(/\[state]/, value);
                try {
                    attributeValue = evaluate(`${value}`);
                } catch (e) {
                    console.error("Invalid expression: " + e?.message);
                }
            } else {
                attributeValue = value;
            }
        }

        const conditions = attribute.conditions;
        const cond = calculateConditions(conditions);
        return cond ? attributeValue : null;
    };

    /**
     * This function is used to calculate the attributes of the component.
     * 
     * @param {object} attributes - The attributes object.
     * @returns {object} The calculated attributes object.
     */
    const calculateAttributes = (attributes) => {
        if (!attributes) return {};

        return Object.values(attributes).reduce((a, attribute) => {
            const attributeValue = calculateAttributeValue(attribute);
            return { ...a, [attribute.key]: attributeValue };
        }, {});
    };

    // Calculate the conditions and attributes using useMemo
    const conds = useMemo(() => {
        try {
            return calculateConditions(conditions);
        } catch (e) {
            return true;
        }
    }, [conditions, colStates, _cstates, _states, _props, mapValue, node._uid]);

    let attr = useMemo(() => {
        try {

            return calculateAttributes(attributes);
        } catch (e) {
            return {};
        }
    }, [attributes, colStates, _cstates, _states, _props, mapValue, node._uid]);

    // Function to calculate class names based on conditions
    const calculateClassNames = (cls) => {
        const conditions = cls.conditions;
        const cond = calculateConditions(conditions);
        let classNames = getValue(cls.stateValue, cls.name);
        classNames = typeof cls.name === 'string' ? cls.name.replace(/\[.*?\]/, classNames?.value || classNames) : '';
        return cond ? classNames : '';
    };

    // Function to reduce class names into a single string
    const reduceClassNames = (classes) => {
        return Object.values(classes).reduce((a, cls) => {
            const classValue = calculateClassNames(cls);
            return a + " " + classValue;
        }, "");
    };

    // useMemo to calculate class names only when dependencies change
    const clss = useMemo(() => {
        let mainClass = node.className || '';

        if (!classes) return mainClass;
        try {
            const list = reduceClassNames(classes);
            return mainClass + " " + list;
        } catch (e) {
            return mainClass;
        }
    }, [classes, colStates, _cstates, _states, _props, mapValue, node._uid, node.className]);

    // Regular expression pattern to match the placeholders in the node value
    const pattern = /\{\{[^}]*\}\}/g;

    // Function to replace placeholders in the node value with their corresponding values
    const replacePlaceholders = (inputString) => {
        let resultString = inputString;
        let match;
        try {
            while ((match = resultString.match(pattern))) {
                const matchedText = match[0];
                const keysString = matchedText.substring(2, matchedText.length - 2);
                const keys = keysString.split('/');
                const modifiedKey = [...keys];
                modifiedKey.shift();
                const elem = { type: keys[0], key: modifiedKey };
                let value = getValue(elem, '');
                value = value?.label || value || '';
                
                resultString = resultString.replace(matchedText, value);
            }
        } catch (e) {
            console.error(e);
        }
        return resultString;
    };

    // useMemo to calculate node value only when dependencies change
    const nodeValue = useMemo(() => {
        if (!node.nodeValue) return '';
        const inputString = node.nodeValue;
        return node.isStateActive === true ? replacePlaceholders(inputString) : inputString;
    }, [classes, colStates, _cstates, _states, _props, mapIndex, mapValue, node.nodeValue, setting?.resize]);

    // useMemo to calculate fallback image only when setting changes
    const fallbackImage = useMemo(() => {
        let defaultImage = '/images/default/default-img.png';
        if (setting && setting['images']?.placeholder.src) return setting['images']?.placeholder.src;
        return defaultImage;
    }, [setting]);

    // useMemo to calculate fallback poster only when setting changes
    const fallbackPoster = useMemo(() => {
        let defaultImage = '/images/default/default-poster.png';
        if (setting && setting['images']?.placeholder.src) return setting['images']?.placeholder.src;
        return defaultImage;
    }, [setting]);

    // useMemo to calculate node value with fallback only when nodeValue changes
    const withFallBackNodeValue = useMemo(() => {
        switch (node.tagName) {
            case 'img':
                return { value: node.src ? setting?.host + node.src.src : setting?.host + fallbackImage, label: node.src?.alt };
            case 'video':
                return {
                    value: node.src ? node.src.src : setting?.host + fallbackPoster,
                    label: node.src?.alt,
                    srcs: node.srcs
                };
            case 'audio':
                return { value: setting?.host + '/audios/default/sample.mp3', srcs: node.srcs };
            case 'input':
            case 'textarea':
            case 'option':
                return nodeValue || '';
            default:
                return nodeValue;
        }
    }, [nodeValue, node.src,  node._uid]);

    // Render the ElementValue component with the calculated props
    const element = <ElementValue
        {...props}
        state={node.state}
        nodeValue={withFallBackNodeValue}
        attributes={attr}
        classes={clss.trim()}
        conds={conds}
    >{children}</ElementValue>;


    return element;
};

export default ElementSetting;