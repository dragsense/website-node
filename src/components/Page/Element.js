

import React from 'react';


const Element = ({   tagName, customAttributes = {}, attributes, classes, children = null }) => {


    return tagName ? React.createElement(
        tagName,
        {
            ...customAttributes,
            ...attributes,
            className: classes
        },
        children
    ) : null
};

export default Element;