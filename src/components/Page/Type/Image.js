
import React, { useMemo } from 'react';

const Image = (props) => {
    const { value, children } = props;


    const image =
        value.value ?
            { src: value.value, alt: value.label || "image" } :
            { src: value, alt: "image" };

    const ImageElement = React.cloneElement(children, {
            customAttributes: {
                src: image.src, alt: image.alt,
                
            }
        })



    return ImageElement;

};

export default Image;