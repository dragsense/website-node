
const React = require("react");

import { useMemo } from "react";

import ElementType from "./ElementType";

import { formatDate } from "../../utils/utils";
import { getStateValue } from '../../utils/element-value';

const ElementValue = (props) => {


    const { state,
        nodeValue,
        mapValue,
        mapIndex,
        _states,
        colStates,
        _props,
        onClick,
        _cstates,
        onChange,
        attributes,
        setting = {},
        classes,
        conds,
        node,
        children } = props;

    const getValue = (elem, value = '') => {
        const type = elem.type;
        const key = elem.key;

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


    const value = useMemo(() => {


        if (!state)
            return nodeValue;


        const value = getValue(state, nodeValue);



        return value || nodeValue;

    }, [state, colStates, _states, _props, mapValue, nodeValue]);

    const onClickNode = (e) => {

        e.preventDefault();

        if (node.onClick) {
            const onclick = node.onClick;

            const withType = onclick.withtype;
            const withkey = onclick.withkey;
            let withValue = getValue({ type: withType, key: withkey });
            withValue = withValue?.value ? withValue.value : withValue

            const stateType = onclick.statetype;
            const stateKey = onclick.statekey;
            let stateValue = getValue({ type: stateType, key: stateKey }, '');
            stateValue = stateValue?.value ? stateValue.value : stateValue;

            if (stateValue?.notClickable)
                return;

            onClick(node, stateValue, withValue);
        }
    }

    const onChangeNode = (value, all) => {
        onChange(node, value, all);

    }

    return <ElementType
        {...props}
        value={value}
        attributes={attributes}
        classes={classes}
        node={node}
        conds={conds}
        mapValue={mapValue}
        mapIndex={mapIndex}
        onChange={node.onChange ? onChangeNode : undefined}

        onClick={node.onClick ? onClickNode : undefined}
    >
        {children}
    </ElementType>



};

export default ElementValue;