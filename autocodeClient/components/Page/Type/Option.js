const React = require("react");

import  { useMemo } from 'react';

// Function to create option object
const createOption = (mapValue, value) => {
    return mapValue ? {value: mapValue.value, label: mapValue.label || mapValue.value} : { value, label: value };
}

// Function to clone children with custom attributes
const cloneChildren = (children, option, mapValue) => {
    return React.cloneElement(children, { customAttributes: { value: option.value } }, [mapValue.label || mapValue.value]);
}

const Option = (props) => {
    const { mapValue, mapIndex, value, children } = props;

    // useMemo to avoid unnecessary re-renders and improve performance
    const option = useMemo(() => createOption(mapValue, value), [mapValue, value]);

    // useMemo to avoid unnecessary re-renders and improve performance
    const inputs = useMemo(() => cloneChildren(children, option, mapValue), [children, option, mapValue]);

    return inputs;
};

export default Option;