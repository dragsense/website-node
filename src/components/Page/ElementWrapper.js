
import React from "react";

import Component from './Component';
import CustomComponent from './CustomComponent';
import Form from './Form';
import ElementComponent from './ElementComponent';
import ElementMapping from "./ElementMapping";
const ElementWrapper = (props) => {

    const { component, form, customPath, node, children, AutocodeCustom, _id } = props;

    return component ? <Component _id={_id} {...props} component={component} >
            {children}
        </Component> : form ?
            <Component
                _id={_id} {...props}
                component={form} >
                <Form _id={_id} form={form} >
                    {children}
                </Form>
            </Component>
            :
            customPath ? <CustomComponent AutocodeCustom={AutocodeCustom} id={_id} {...props}> {children}</CustomComponent> :

                node.type == 'component' ?
                    <ElementComponent id={_id} {...props} >{children}</ElementComponent>
                    :
                    <ElementMapping {...props} map={node.map}>{children}</ElementMapping>

        ;


};

export default ElementWrapper;