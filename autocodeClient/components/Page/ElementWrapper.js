import React from "react";
import Component from './Component';
import CustomComponent from './CustomComponent';
import Form from './Form';
import ElementComponent from './ElementComponent';
import ElementMapping from "./ElementMapping";
import ErrorBoundary from "./ErrorBoundary";

/**
 * ElementWrapper is a component that conditionally renders child components based on props.
 *
 * @param {object} props - The component's props.
 * @returns {JSX.Element} - The rendered JSX element.
 */
const ElementWrapper = (props) => {
    const { component, form, customPath, node, children, _id } = props;

    const Wrraper = () => {
        if (component) {
            // Render Component
            return (
                <Component _id={_id} {...props} component={component}>
                    {children}
                </Component>
            );
        } else if (form) {
            // Render Component with Form
            return (
                <Component _id={_id} {...props} component={form}>
                    <Form _id={_id} form={form}>
                        {children}
                    </Form>
                </Component>
            );
        } else if (customPath) {
            // Render CustomComponent
            return (
                <CustomComponent id={_id} {...props}>
                    {children}
                </CustomComponent>
            );
        } else if (node.type === 'component') {
            // Render ElementComponent
            return (
                <ElementComponent id={_id} {...props}>
                    {children}
                </ElementComponent>
            );
        } else {
            // Render ElementMapping

            return (
                <ElementMapping {...props} map={node.map}>
                    {children}
                </ElementMapping>
            );
        }
    }

    return <ErrorBoundary>{Wrraper()}</ErrorBoundary>
};

export default ElementWrapper;
