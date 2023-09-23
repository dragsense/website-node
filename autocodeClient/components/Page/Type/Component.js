const React = require("react");

import { Children, useMemo, useCallback } from 'react';



// Function to create custom attributes for the element
const createCustomAttributes = (onMouseMove, onClick, onScroll) => {
    return {
        onMouseMove,
        onScroll,
        onClick: onClick ? onClick : (e) => {
            const currentElement = e.target;
            if (currentElement.tagName.toLowerCase() === 'a' ||
                currentElement.parentNode.tagName.toLowerCase() === 'a') {
                // Prevent the default behavior for anchor links
                e.preventDefault();
            }
        },

    }
}

const Component = ({

    onMouseMove,
    conds,
    onScroll,
    onClick,
    innerWraaper,
    value,
    children,
}) => {

    const spanElement = useMemo(() => {
        return <>{value}
            {innerWraaper}</>
    }, [innerWraaper, value]);

    const customAttributes = createCustomAttributes(onMouseMove, onClick, onScroll);

    const clonedElement = useMemo(() => React.cloneElement(children, { customAttributes }, spanElement), [children, customAttributes, spanElement]);


    // Return disabled element if disabled, else return clonedElement
    return conds ? clonedElement : null;

};

export default Component;