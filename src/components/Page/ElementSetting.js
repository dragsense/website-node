
import React, { useMemo } from "react";

import ElementValue from './ElementValue';
import { formatDate } from "../../utils/utils";
import { getStateValue } from '../../utils/element-value';

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
                else
                    if (key[0] === "PAGE") {
                        if (key[1] === 'image') {
                            const image = setting[key[1]];
                            return {
                                value: image?.src ? image.src : '/images/default/default-img.png',
                                label: image === undefined ? `[featured image]` : image?.alt || 'Featured Image'
                            }
                        }
                        if (key[1] === 'creator') {
                            const creator = setting[key[1]];

                            return {
                                value: creator?._id ? creator?._id : '',
                                label: creator?.name ? creator?.name : 'Unknown'
                            }
                        }
                        if (key[1] === 'createdAt') {
                        
                            const createdAt = setting[key[1]];
                            if (createdAt)
                                return formatDate(createdAt, key[2])
                            else return `[page ${key[1]}]`
                        } 
                        if (key[1] === 'status') {
                            const status = setting[key[1]];

                            return {
                                value: status,
                                label: status === undefined ? `[page status]` : status ? 'Published' : 'Draft'
                            }
                        }
                        
                        return {

                            value: key[1] === 'content' ? key[1] : setting[key[1]],
                            label: setting[key[1]] || `[page ${key[1]}]`
                        }
                    } else
                        if (key[0] === "NEXTDOCUMNET" || key[0] === 'PREVDOCUMNET') {
                            const doc = setting[key[0]];

                            if (!doc) {
                                return {
                                    value: `[document ${key[1]}]`,
                                    label: `[document ${key[1]}]`
                                }
                            }

                            if (key[1] === 'image') {
                                const image = doc[key[1]];
                                return {
                                    value: image?.src ? image.src : '/images/default/default-img.png',
                                    label: image === undefined ? `[featured image]` : image?.alt || 'Featured Image'
                                }
                            }
                            return {
                                value: doc[key[1]],
                                label: doc[key[1]] || `[document ${key[1]}]`
                            }
                        } else
                            return {

                                value: setting[key[0]],
                                label: setting[key[0]] || `[page ${key[0]}]`
                            }
            case 'PROPS':
                return getStateValue(key, _props) || `[props.${key}]`;
            case 'STATES': 
                return getStateValue(key, _states);

            case 'PAGESTATES':

                const v = getStateValue(key, _states);
                if (v)
                    return v;

                return getStateValue(key, _props);
            case 'COLSTATES':


                if (key[0] === 'POPULATED')
                    key.shift();


                if (key[0] === 'states' || key[0] === 'states' + mapIndex) {
                    const modifiedKey = [...key];
                    modifiedKey.shift();


                    return getStateValue(modifiedKey, colStates.states);
                }
                else
                    if (key[0] === 'RELATIONSHIPS' && colStates.relationships) {
                        if (key[1] >= 0 && key[2])
                            return colStates.relationships[key[1]][key[2]];
                        else
                            return null;
                    }
                    else
                        if (key[0] === 'PAGES') {
                            return mapIndex + 1;
                        }
                       
                        else {
                            if (key[0] === 'docsLength' && colStates.documents)
                                return colStates.documents.length || '0';
                            else
                                if (key[0] === 'SETTING') {


                                    const setting = colStates.setting;
                                    if (setting) {
                                        if (key[1] === 'image') {

                                            if (colStates['populatedImage']) {
                                                const image = colStates['populatedImage'][0] || {};

                                                return {
                                                    value: image?.src ? image.src : '/images/default/default-img.png',
                                                    label: image === undefined ? `[featured image]` : image?.alt || 'Featured Image'
                                                }
                                            }
                                            return {
                                                value: '/images/default/default-img.png',
                                                label: 'Featured Image'
                                            }
                                        }

                                        return {

                                            value: setting[key[1]] || '',
                                            label: setting[key[1]] || `[page ${key[1]}]`
                                        }
                                    } else return "";

                                }
                                else
                                    if (key[0] === 'createdAt') {
                                        if (colStates[key[0]])
                                            return formatDate(colStates[key[0]], key[1])
                                        else return ''
                                    } else
                                        if (key[0] === 'creator') {
                                            const creator = colStates[key[0]];

                                            return {
                                                value: creator?._id ? creator?._id : '',
                                                label: creator?.name ? creator?.name : 'Unknown'
                                            }
                                        }

                                        else {
                                            return colStates[key[0]]
                                        }
                        }
            case 'FORMSTATES':
                if (_states && _states[key[0]])
                    return _states[key[0]][key[1]]

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
                let orignal = expression.replace(/\[value]/g, v);
                orignal = orignal.replace(/\[key]/g, keyValue);

                try {
                    cond = eval(orignal);
                } catch (e) {
                    console.error("Invalid expression:", e);
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
                const value = stateValue?.value || stateValue;

                let v = "";
                if (attribute.key === 'backgroundImage') {
                    v = value ? `url(${value})` : `url(${attribute.value})`;
                }
                if (attribute.key === 'href' && attribute.value) {
                    const customValue = attribute.value; ///post/[slug]

                    v = value ? customValue.replace(/\[.*?\]/, value) : attribute.value;
                } else
                    v = value ? value : attribute.value;

                atrributeValue = v;
            }

            const conditions = attribute.conditions;
            const cond = calculateConditions(conditions);
            atrributeValue = cond ? atrributeValue : null;



            return { ...a, [attribute.key]: atrributeValue }
        }, {});
    }



    const conds = useMemo(() => {
        return calculateConditions(conditions)

    }, [conditions, colStates, _states, _props, mapValue, node._uid]);


    let attr = useMemo(() => {
        return calculateAttributes(attributes);

    }, [attributes, colStates, _states, _props, mapValue, node._uid]);


    const clss = useMemo(() => {


        if (!Array.isArray(classes))
            return node.className;

        const list = classes.reduce((a, cls) => {
            const conditions = cls.conditions;
            const cond = calculateConditions(conditions);
            const classValue = cond ? cls.name : '';

            return a + " " + classValue;
        }, "");


        return node.className + " " + list;


    }, [classes, colStates, _states, _props, mapValue, node._uid]);


    const fallBackNodeValue = () => {

        switch (node.tagName) {
            case 'img':
                return node.nodeValue ?
                    { value: node.src ? node.src.src : './images/default/default-img.png', label: node.src?.alt }
                    :
                    './images/default/default-img.png';
            case 'video':
                return {
                    value: node.src ?
                        node.src.src : './images/default/default-poster.png',
                    label: node.src?.alt, srcs: node.srcs
                }
            case 'audio':
                return { value: './audios/default/sample.mp3', srcs: node.srcs }
            case 'input':
            case 'textarea':
            case 'option':
                return node.nodeValue || ''
            default:
                return node.nodeValue || node.childNodes?.length > 0 ? node.nodeValue :
                    `<span style="user-select: none; color: #cccccc;">${node.layout || node.tagName}</span>`
        }
    }

    const nodeValue = node.layout === 'empty' ? '' : fallBackNodeValue();





    const element = <ElementValue
        {...props}
        state={node.state}
        nodeValue={nodeValue}
        attributes={attr}
        classes={clss}
        conds={conds}
    >{children}</ElementValue>

    return element;


};

export default ElementSetting;