
import React, { useMemo } from 'react';

const Image = (props) => {
    const { conds,
        onMouseMove,
        onClick, value, children } = props;


    const image =
        value.value ?
            { src: value.value, alt: value.label || "image" } :
            { src: value || value, alt: "image" };

    const ImageElement = React.cloneElement(children, {
        customAttributes: {
            onMouseMove: onMouseMove,
            onClick: onClick,

            src: image.src, alt: image.alt,


        }

    })




    return conds ? ImageElement : null;


};

export default Image;