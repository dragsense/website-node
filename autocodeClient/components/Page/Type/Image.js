import React, { useMemo, useCallback } from 'react';

// Function to create image object
const createImageObject = (value) => {
    
    return value.value ?
        { src: value.value, alt: value.label || "image" } :
        { src: value || value, alt: "image" };
}

// Function to create custom attributes for image element
const createCustomAttributes = (_uid, onMouseMove, onClick, onMouseEnter,
    onMouseLeave, image) => {
    return {
        onMouseMove,
        onMouseLeave,
        onMouseEnter,
        onClick: onClick,
        src: image.src, alt: image.alt,
    }
}

const Image = (props) => {
    const { _uid, conds,  onMouseMove, onMouseEnter,
        onMouseExit, onClick, value, children } = props;

   
    // Create image object
    const image = useMemo(() => createImageObject(value), [value]);
   
    // Create custom attributes for image element
    const customAttributes = useMemo(() => createCustomAttributes(_uid, onMouseMove, onClick, onMouseEnter,
        onMouseExit, image), [_uid,onMouseMove, onClick, image]);

    // Clone children and add custom attributes
    const ImageElement = useMemo(() => React.cloneElement(children, { customAttributes }), [children, customAttributes]);

    // Return disabled element if disabled, else return ImageElement
    return conds ? ImageElement : null;
};

export default Image;