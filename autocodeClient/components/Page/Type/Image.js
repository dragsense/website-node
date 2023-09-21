const React = require("react");

import  { useMemo } from 'react';

// Function to create image object
const createImageObject = (value) => {
    
    return value.value ?
        { src: value.value, alt: value.label || "image" } :
        { src: value || value, alt: "image" };
}

// Function to create custom attributes for image element
const createCustomAttributes = (_uid, onMouseMove, onClick, image) => {
    return {
        onMouseMove: onMouseMove,
        onClick: onClick,
        src: image.src, alt: image.alt,
    }
}

const Image = (props) => {
    const { _uid, conds,  onMouseMove, onClick, value, children } = props;

    // Styles for disabled image
    const disabledStyles = useMemo(() => ({
        opacity: 0.2,
        border: '1px dashed #ccc',
    }), []);

    // Create image object
    const image = useMemo(() => createImageObject(value), [value]);
   
    // Create custom attributes for image element
    const customAttributes = useMemo(() => createCustomAttributes(_uid, onMouseMove, onClick, image), [_uid,onMouseMove, onClick, image]);

    // Clone children and add custom attributes
    const ImageElement = useMemo(() => React.cloneElement(children, { customAttributes }), [children, customAttributes]);

    // Return disabled element if disabled, else return ImageElement
    return conds ? ImageElement : null;
};

export default Image;