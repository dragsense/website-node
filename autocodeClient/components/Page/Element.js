const React = require("react");

/**
 * Element component renders a HTML element with given tagName and attributes.
 * If tagName is not provided, it renders an InlineSkeleton component.
 * 
 * @param {string} tagName - The HTML tag name of the element to render.
 * @param {object} customAttributes - Custom attributes to be added to the element.
 * @param {object} attributes - Additional attributes to be added to the element.
 * @param {string} classes - CSS classes to be added to the element.
 * @param {React.ReactNode} children - The content to be rendered inside the element.
 * @returns {React.ReactNode} The rendered element.
 */
const Element = ({ key, tagName, customAttributes = {}, attributes, classes, children = null }) => {

    const elementProps = {
        ...customAttributes,
        ...attributes,
       
        className: classes || undefined
    };
    
    return tagName ? React.createElement(
        tagName,
        elementProps,
        children
    ) : <></>;
};

export default Element;
