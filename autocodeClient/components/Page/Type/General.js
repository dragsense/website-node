import React, { Children, useMemo, useCallback } from 'react';

// Function to create custom attributes for the element
const createCustomAttributes = (onMouseMove,  onClick, onScroll,  onMouseEnter, onMouseLeave) => {
    return {
        onMouseMove,
        onScroll,
        onMouseEnter,
        onMouseLeave,
        onClick

    }
}

const General = ({  conds, onMouseMove, onClick, onScroll,onMouseEnter,
    onMouseExit, innerWraaper, value, children }) => {



    // Create custom attributes for the element
    const customAttributes = createCustomAttributes(onMouseMove, onClick, onScroll, onMouseEnter, onMouseExit);

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