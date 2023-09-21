const React = require("react");

import { Children, useMemo, useCallback } from 'react';

// Function to create custom attributes for the element
const createCustomAttributes = (onMouseMove,  onClick, onScroll) => {
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

const General = ({  conds, onMouseMove, onClick, onScroll, innerWraaper, value, children }) => {



    // Create custom attributes for the element
    const customAttributes = createCustomAttributes(onMouseMove, onClick, onScroll);

    // Create span element based on the innerWrapper
    const spanElement = useMemo(() => {
        return (value || innerWraaper) ?  (<>
            {React.isValidElement(value) ? value : value && <span
                dangerouslySetInnerHTML={{ __html: value }}
            />}
            {innerWraaper}</>
        ) : 
        <></>;
    }, [innerWraaper, value]);

    // Clone the element with custom attributes and span element
    const clonedElement = useMemo(() => React.cloneElement(children, { customAttributes }, spanElement), [children, customAttributes, spanElement]);

 
    // Return disabled element if disabled, else return clonedElement
    return conds ? clonedElement : null;

};

export default General;