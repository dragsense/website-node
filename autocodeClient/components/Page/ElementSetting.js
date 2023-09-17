const React = require("react");


import  { useMemo } from "react";

import ElementValue from './ElementValue';
import { getStateValue, getPageValue } from '../../utils/element-value';


const ElementSetting = (props) => {

    const { conditions,
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
        node } = props;

    const getValue = (elem, value = '') => {
        const type = elem?.type;
        const key = elem?.key;


        switch (type) {
            case 'GLOBAL':
                if (key[0] === "WINDOW") {
                    if (key[1] === 'width') {
                        return window.innerWidth;
                    } else
                        if (key[1] === 'height') {
                            return window.innerHeight;
                        }
                } else
                    if (key[0] === "WEBSITE") {
                        const global = setting.global || [];
                        if (key[1] === 'images') {
                            const images = global[key[1]] || {};
                            const image = images[key[2]] || {}
                            return {
                                value: image?.src ? image.src : '/images/default/default-img.png',
                                label: image === undefined ? `[${key[2]}]` : image?.alt || "Global Image"
                            }

                        }

                        return {
                            value: global[key[1]],
                            label: global[key[1]] || `[global ${key[1]}]`
                        }
                    }
                    

            case 'PROPS':
                return getStateValue(key, _props) || `[props.${key}]`;
            case 'STATES':
                return getStateValue(key, _states);
                case 'PAGE':
                    return getPageValue(key, setting);
            case 'COLSTATES':


                if (!colStates)
                    return value;


                if (key[0] === 'PAGES')
                    return mapIndex + 1;
                else
                    if (key[0] === 'docsLength' && colStates.documents)
                        return colStates.documents.length || '0';
                    else
                        return getPageValue(key, colStates);

            case 'FORMSTATES':
                if (_states && _states[key[0]])
                    return _states[key[0]][key[1]] || '[form state]'

            case 'MAPVALUE':
                return mapValue;
            case 'MAPINDEX':
                return mapIndex;
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                return getStateValue(key, _cstates);

            default:
                return value;

        }
    }

    const calculateConditions = (conditions) => {

        if (!conditions || !node._uid)
            return true;

        return Object.values(conditions).reduce((prev, condition) => {
            const match = condition.match;
            const value = getValue(condition);
            const keyValue = value?.value !== undefined ? value?.value : value;

            const stateValue = getValue(condition.valueState, '');
            const v = stateValue?.value !== undefined ? stateValue.value : stateValue;

            let expression = condition.value;

            let cond = true;

            if (expression) {
                let orignal = expression.replace(/\[state]/g, v);
                orignal = orignal.replace(/\[key]/g, keyValue);

                try {
                    cond = eval(orignal);
                } catch (e) {
                    message.error("Invalid expression: " + e?.message);
                    return true;

                }
            }
            const result = condition.relation == 'AND' ? prev && cond : prev || cond;
            return result;
        },
            true);
    }

    const calculateAttributes = (attributes) => {

        if (!attributes)
            return {};

        return Object.values(attributes).reduce((a, attribute) => {


            let atrributeValue = null;

            if (attribute.key === 'style') {
                atrributeValue = calculateAttributes(attribute.attributes)


            }
            else {
                const stateValue = getValue(attribute.valueState, attribute.value);
                let value = stateValue?.value || stateValue;
                if (typeof attribute.value === 'string') {
                    value = attribute.value.replace(/\[state]/, value);
                    try {
                        atrributeValue = eval(value);
                    } catch (e) {
                        message.error("Invalid expression: " + e?.message);
                    }
                } else
                    atrributeValue = value;
            }

            const conditions = attribute.conditions;
            const cond = calculateConditions(conditions);
            atrributeValue = cond ? atrributeValue : null;



            return { ...a, [attribute.key]: atrributeValue }
        }, {});
    }



    const conds = useMemo(() => {
        try {
            return calculateConditions(conditions);
        }
        catch (e) {
            return true;
        }

    }, [conditions, colStates, , _cstates, _states, _props, mapValue, node._uid]);


    let attr = useMemo(() => {
        try {
            return calculateAttributes(attributes);
        }
        catch (e) {
            return {};
        }
    }, [attributes, colStates, , _cstates, _states, _props, mapValue, node._uid]);


    const clss = useMemo(() => {


        if (!classes)
            return node.className;

        try {

            const list = Object.values(classes).reduce((a, cls) => {
                const conditions = cls.conditions;
                const cond = calculateConditions(conditions);

                let classNames = getValue(cls.stateValue, cls.name);

                classNames = typeof cls.name === 'string' ?
                    cls.name.replace(/\[.*?\]/, classNames?.value || classNames) : ''

                const classValue = cond ? classNames : '';

                return a + " " + classValue;
            }, "");


            return node.className + " " + list;
        }
        catch (e) {
            return node.className;
        }


    }, [classes, colStates, , _cstates, _states, _props, mapValue, node._uid, node.className]);

    const pattern = /\{\{[^}]*\}\}/g;

    const nodeValue = useMemo(() => {

        if (!node.nodeValue)
            return node.layout || node.tagName;

        const inputString = node.nodeValue;
        let resultString = inputString;
        let match;

        try {
            // while ((match = resultString.match(pattern))) {
            //     const matchedText = match[0];
            //     const keysString = matchedText.substring(2, matchedText.length - 2);
            //     const keys = keysString.split('/');
            //     const modifiedKey = [...keys];
            //     modifiedKey.shift();
            //     const elem = { type: keys[0], key: modifiedKey }
            //     let value = getValue(elem, '');
            //     value = value?.value || value || '';
            //     const replacementValue = '[' + value + ']';
            //     resultString = resultString.replace(matchedText, replacementValue);
            // }
        }
        catch (e) {
        } finally {
            return resultString;
        }

    }, [classes, colStates, , _cstates, _states, _props, mapIndex, mapValue, node.nodeValue]);

    const fallbackImage = useMemo(() => {

        let defaultImage = './images/default/default-img.png';


        if (setting && setting['images']?.placeholder.src)
            return setting['images']?.placeholder.src;

        return defaultImage;

    }, [setting]);

    const fallbackPoster = useMemo(() => {

        let defaultImage = './images/default/default-poster.png';


        if (setting && setting['images']?.placeholder.src)
            return setting['images']?.placeholder.src;

        return defaultImage;

    }, [setting]);


    const withFallBackNodeValue = useMemo(() => {

        switch (node.tagName) {
            case 'img':
                return { value: node.src ? node.src.src : fallbackImage, label: node.src?.alt }
            case 'video':
                return {
                    value: node.src ?
                        node.src.src : fallbackPoster,
                    label: node.src?.alt, srcs: node.srcs
                }
            case 'audio':
                return { value: './audios/default/sample.mp3', srcs: node.srcs }
            case 'input':
            case 'textarea':
            case 'option':
                return nodeValue || '';
            default:
                return nodeValue;
        }

    }, [nodeValue]);




    const element = <ElementValue
        {...props}
        state={node.state}
        nodeValue={withFallBackNodeValue}
        attributes={attr}
        classes={clss}
        conds={conds}
    >{children}</ElementValue>

    return element;


};

export default ElementSetting;