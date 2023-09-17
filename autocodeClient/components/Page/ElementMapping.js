const React = require("react");

import { useEffect, useMemo } from "react";

import { getStateStates, getPaginationRange, getPageStates  } from '../../utils/element-value';

import ElementLayout from "./ElementLayout";

const ElementMapping = (props) => {

    const { map, node, _states, _props, setting, _cstates, colStates, children, mapValue } = props;

    const getValue = (elem, value = []) => {
        const type = elem.type;
        const key = elem.key;
      

        switch (type) {

            case 'STATES':

                return getStateStates(key, _states);
            case 'PROPS':

                return getStateStates(key, _props);
            case 'PAGE':

                if (key[0] === 'RELATIONSHIPS' && setting.populatedRelationships) {
                    const docs = setting.populatedRelationships[key[1]];
               
                    return getPageStates(docs, 'pages');
                }
            case 'COLSTATES':


                if (!colStates)
                    return;

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
                                key: value._id,
                                ...value
                            }
                        })
                    } else
                    
                        if (key[0] === 'RELATIONSHIPS' && colStates.populatedRelationships) {
                            const docs = colStates.populatedRelationships[key[1]];

                            return getPageStates(docs, 'docs');
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
                                        key: val,
                                        notClickable: isNan,
                                    }
                                });


                                return pages;
                            }

                }
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':

                if (!_cstates)
                    return;

                if (key[0] === 'items') {


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
                            key: val,
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
            return { label: val[1], value: val[0], key: val[0] }
        })

    }, [node.options]);


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