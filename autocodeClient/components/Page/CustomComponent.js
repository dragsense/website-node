
import React, { useEffect, useState } from "react";

import ElementSetting from "./ElementSetting";
import { getStates } from '../../utils/element-value';

// CustomComponent is a component that loads a custom component from a given path and manages its states and props
const CustomComponent = (props) => {

    const { children, customPath, node, _states, _props, onSetStates, mapValue, mapIndex, AutocodeCustom } = props;



    // Function to get the state value for a given key
    const getStateValue = (key) => {


        if (!_states || key) {
            return null;
        }
        return getStates(key, _states)
    };

    // Function to get the prop value for a given key
    const getPropValue = (key) => {


        if (!_states || key) {
            return null;
        }
        return getStates(key, _props)
    };

    // Function to update the state for a given key and value
    const updateState = (key, value) => {


        if (onSetStates) {
            onSetStates(key, value, 'STATES')
        }
    }

    // Function to update the prop for a given key and value
    const updateProp = (key, value) => {
        if (onSetStates) {
            onSetStates(key, value, "PROPS")
        }
    }

    return (
            <ElementSetting
                {...props}
                attributes={node.attributes}
                classes={node.classes}
                conditions={node.conditions}
                mapValue={mapValue}
                mapIndex={mapIndex}
            >{AutocodeCustom ? <><AutocodeCustom
                name={customPath}
                getStateValue={getStateValue}
                getPropValue={getPropValue}
                updateProp={updateProp}
                updateState={updateState}>{children}</AutocodeCustom></> : children}</ElementSetting>

    );


};


export default CustomComponent;