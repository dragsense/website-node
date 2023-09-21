const React = require("react");

import { useMemo } from 'react';

// Function to create custom attributes for the icon
const createCustomAttributes = (onMouseMove, onClick, value, layout) => {
    return {
        onClick,
        onMouseMove,
        dangerouslySetInnerHTML: { __html: layout === 'svg-icon' ? value : '' },
    }
}

const Icon = ({  conds, onMouseMove, onClick, value, layout, children }) => {



    // Create custom attributes for the icon
    const customAttributes = useMemo(() => createCustomAttributes(onMouseMove, onClick, value, layout), [onMouseMove, onClick, value, layout]);

    // Clone children and add custom attributes
    const clonedElement = useMemo(() => React.cloneElement(children, { customAttributes }), [children, customAttributes]);

    // Return disabled element if disabled, else return clonedElement
    return conds ? clonedElement : null;

};

export default Icon;