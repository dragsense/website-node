import React, { useEffect, useMemo } from "react";

import { getStateStates, getPaginationRange } from '../../utils/element-value';

import ElementLayout from "./ElementLayout";

const ElementMapping = (props) => {

    const { map, node, _states, _props, setting, _cstates, colStates, children, mapValue } = props;

    const getValue = (elem, value = []) => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'GLOBAL':
                if (key[0] === "PAGES") {
                    if (setting?.pages)
                        return setting.pages.map((value) => {
                            return {
                                type: "pages",
                                label: value.name,
                                value: value._id,
                                ...value
                            }
                        })
                }


            case 'STATES':
                return getStateStates(key, _states);
            case 'PROPS':
                return getStateStates(key, _props);
            case 'PAGESTATES':
                
                const v = getStateStates(key, _states);
                if (v)
                    return v;

                return getStateStates(key, _props);
            case 'COLSTATES':
                if (key[0] === 'STATES') {
                    const modifiedKey = [...key];
                    modifiedKey.shift();
                    return getStateStates(modifiedKey, colStates.states);;
                }
                else {

                    if (key[0] === 'DOCUMENTS' && colStates.documents) {
                        return colStates.documents.map((value) => {
                            return {
                                type: "docs",
                                label: value.name,
                                value: value._id,
                                ...value
                            }
                        })
                    } else
                        if (key[0] === 'RELATIONSHIPS' && colStates.populatedRelationships) {

                            const docs = colStates.populatedRelationships[key[1]];
                            return docs?.length > 0 ? docs.map((value) => {
                                return {
                                    type: "docs",
                                    label: value.name,
                                    value: value._id,
                                    ...value
                                }
                            }) : [{
                                label: '[Relation]',
                                value: '',
                            }]
                        }
                        else
                            if (key[0] === 'PAGES') {
                                const currentPage = colStates.page || 1;
                                const totalPages = Math.ceil(colStates.maxPage / colStates.limit);
                                const pagination = colStates.pagination || { leftRange: 1, rightRange: 1, nearRange: 4 }
                                const pages = getPaginationRange(currentPage, totalPages, pagination).map((value, index) => {

                                    const val = parseInt(value);
                                    const isNan = isNaN(val);
                                    return {
                                        label: value,
                                        value: val,
                                        notClickable: isNan,
                                    }
                                });


                                return pages;
                            }
                            else {
                                if (key[0] === 'docsLength' && colStates.documents)
                                    return colStates.documents.length;
                                else
                                    return colStates[key[0]]
                            }
                }
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                if (key[0] === 'pages') {
                    const value = _cstates[key[0]];

                    if (value?.states)
                        return value.states.map((value) => {
                            return {
                                type: "pages",
                                label: value.name,
                                value: value._id,
                                ...value
                            }
                        })
                } else if (key[0] === 'items') {


                    const currentPage = _cstates['currentIndex'] ? _cstates['currentIndex'].defaultValue : 1;
                    const limit = _cstates['limit'] ? _cstates['limit'].defaultValue || 1 : 1;
                    const total = _cstates['total'] ? _cstates['total'].defaultValue : 1;

                    const totalPages = Math.ceil(total / limit);

                    const pagination = { leftRange: 1, rightRange: 1, nearRange: 4, dots: '...' }
                    const pages = getPaginationRange(currentPage, totalPages, pagination).map((value, index) => {

                        const val = parseInt(value);
                        const isNan = isNaN(val);
                        return {
                            label: value,
                            value: val,
                            notClickable: isNan,
                        }
                    });

                    return pages;
                }
                else
                    return getStateStates(key, _cstates);
            default:
                return value;
        }

    }


    let nodes = useMemo(() => {


        if (!map)
            return [];

        let values = getValue(map);

        return values || [];

    }, [map, _states, _cstates, _props, colStates, mapValue]);

    let options = useMemo(() => {

        if (!node.options)
            return [];

        const options = node.options.split(",");
        return options.map((value) => {
            const val = value.split(":");
            return { label: val[1], value: val[0] }
        })

    }, [node.options]);

    // const childs = React.Children.map(children, (child) => {
    //     return React.cloneElement(child, {
    //         mapValue,
    //         mapIndex
    //     });
    // })




    // const elements = (node.layout == 'select' || node.tagName == 'select') ?
    //     element(mapValue, mapIndex, [...options, ...nodes].map((mapValue, mapIndex) => {

    //         return <ElementSetting
    //             key={mapIndex}
    //             states={states}
    //             node={{ _uid: mapIndex + 1, tagName: 'option' }}
    //             attributes={node.childAttributes}
    //             classes={{}}
    //             conditions={node.childConditions}
    //             mapValue={mapValue}
    //             mapIndex={mapIndex}
    //         />
    //     }
    //     ))

    //     : [...options, ...nodes].map((mapValue, mapIndex) => element(mapValue, mapIndex, React.Children.map(children, (child) => {
    //         return React.cloneElement(child, {
    //             key: mapIndex,
    //             mapValue,
    //             mapIndex,
    //             colStates: { ...colStates, ...mapValue }
    //         });
    //     })))



    // if ((node.layout == 'select' || node.tagName == 'select') && nodes.length > 0) {
    //     options = nodes;
    //     nodes = [];

    // }

    return <ElementLayout
        {...props}
        nodes={[...options, ...nodes]}
        layout={node.layout}
        options={options}
    >
        {children}
    </ElementLayout>


    //return [...options, ...nodes].length > 0 ? elements : element(mapValue, mapIndex, childs);


};

export default ElementMapping;