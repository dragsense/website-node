const React = require("react");

import  { useMemo } from 'react';

// Function to create custom attributes for the element
const createCustomAttributes = ({ onMouseMove, onClick }) => ({
    onMouseMove: onMouseMove,
    onClick: onClick,
});



const CloseTag = (props) => {
    const {  children, conds, onMouseMove, onClick } = props;

    // useMemo to optimize performance by memoizing the output of createCustomAttributes and createDisabledStyles
    const customAttributes = useMemo(() => createCustomAttributes({  onMouseMove, onClick }), [onMouseMove, onClick]);

    // Clone the children element with custom attributes
    const CloseElement = React.cloneElement(children, { customAttributes });


    // Return the disabled element if disabled prop is true, else return the CloseElement
    return conds ? CloseElement : null;
};

export default CloseTag;