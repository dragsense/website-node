const React = require("react");

import { useCallback, useMemo } from "react";
import { getStateStates, getPaginationRange, getPageStates } from '../../utils/element-value';

import ElementLayout from "./ElementLayout";

// Main component
const ElementMapping = (props) => {
    // Destructuring props
    const { map, node, _states, _props, setting, _cstates, colStates, children, mapValue } = props;

    // Function to handle 'STATES' type
    const handleStates = useCallback((key, states, host) => {
        return getStateStates(key, states, host);
    }, []);

    // Function to handle 'PAGE' type
    const handlePage = useCallback((key) => {
        if (key[0] === 'RELATIONSHIPS' && setting.populatedRelationships) {
            const docs = setting.populatedRelationships[key[1]];
            return getPageStates(docs, 'pages');
        }
    }, [setting]);

    // Function to handle 'COLSTATES' type
    const handleColStates = useCallback((key) => {
        if (!colStates) return;

        if (key[0] === 'STATES') {
            const modifiedKey = [...key];
            modifiedKey.shift();
            return getStateStates(modifiedKey, colStates.states);
        }
        else {
            return handleColStatesSubTypes(key);
        }
    }, [colStates]);

    // Function to handle subtypes of 'COLSTATES'
    const handleColStatesSubTypes = useCallback((key) => {
        if (key[0] === 'DOCUMENTS' && colStates.documents) {
            return  getPageStates(colStates.documents, 'docs');
        } else if (key[0] === 'RELATIONSHIPS' && colStates.populatedRelationships) {
            const docs = colStates.populatedRelationships[key[1]];
            return getPageStates(docs, 'pages');
        } else if (key[0] === 'PAGES') {
            return handlePages(key);
        }
    }, [colStates]);

    // Function to handle 'PAGES' subtype of 'COLSTATES'
    const handlePages = useCallback((key) => {
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
    }, [colStates]);

    // Function to handle other types
    const handleOtherTypes = useCallback((key) => {
        if (!_cstates) return;

        if (key[0] === 'items') {
            const items = _cstates['items']?.states || {}

            const pages = Object.values(items || {}).map((value, index) => {
                const val = value.value.split(":");
                return { label: val[1], value: val[0], key: val[0] }
            });

            return pages;
        }
        else {
            return getStateStates(key, _cstates);
        }
    }, [_cstates]);

    // Main function to get value
    const getValue = useCallback((elem, value = []) => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'STATES':
                return handleStates(key, _states, setting?.host);
            case 'PROPS':
                return handleStates(key, _props, setting?.host);
            case 'PAGE':
                return handlePage(key);
            case 'COLSTATES':
                return handleColStates(key);
            default:
                return handleOtherTypes(key);
        }
    }, [handleStates, handlePage, handleColStates, handleOtherTypes, _states, _props]);


    // Using useMemo to optimize performance by memoizing the values and options
    // This will prevent unnecessary re-rendering and computations when the dependencies haven't changed
    const getValues = useCallback(() => {
        if (!map) return [];
        return getValue(map) || [];
    }, [map, getValue]);

    const getOptions = useCallback(() => {
        if (!node.options) return [];
        const options = node.options.split(",");
        return options.map((value) => {
            const val = value.split(":");
            return { label: val[1], value: val[0], key: val[0] }
        });
    }, [node.options]);

    let nodes = useMemo(getValues, [map, getValues]);
    let options = useMemo(getOptions, [node.options]);



    return (
        <ElementLayout
            {...props}
            nodes={[...options, ...nodes]}
            layout={node.layout}
            options={options}>
            {children}
        </ElementLayout>
    );

};

export default ElementMapping;