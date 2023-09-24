import React, { Children, useMemo, useCallback } from 'react';



// Function to create custom attributes for the element
const createCustomAttributes = (onMouseMove, onClick, onScroll, onMouseEnter, onMouseLeave) => {
    return {
        onMouseMove,
        onScroll,
        onMouseEnter,
        onMouseLeave,
        onClick
    }
}

const Component = ({

    onMouseMove,
    conds,
    onScroll,
    onClick,
    innerWraaper,
    onMouseEnter,
    onMouseExit,
    value,
    children,
}) => {



    const spanElement = useMemo(() => {
        return <>{value}
            {innerWraaper}</>
    }, [innerWraaper, value]);

    const customAttributes = createCustomAttributes(onMouseMove, onClick, onScroll, onMouseEnter, onMouseExit);

    const clonedElement = useMemo(() => React.cloneElement(children, { customAttributes }, spanElement), [children, customAttributes, spanElement]);


    // Return disabled element if disabled, else return clonedElement
    return conds ? clonedElement : null;

};

export default Component;