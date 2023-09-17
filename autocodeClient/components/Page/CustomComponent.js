const React = require("react");

import { useEffect, useMemo } from "react";

import ElementSetting from "./ElementSetting";
import { getStates,} from '../../utils/element-value';

const CustomComponent = (props) => {

    const { children, customPath, 
        node, 
        _states, _props, 
        AutocodeCustom, 
        onSetStates, mapValue, mapIndex } = props;


    const loadComponent = async (path) => {
    }; <div>This component is Loading...</div>,

        useEffect(() => {
            loadComponent(customPath);
        }, [])

    const getStateValue = (key) => {
        if (!_states || !key) {
            return null;
        }

        return getStates(key, _states)

    };

    const getPropValue = (key) => {
        if (!_states || !key) {
            return null;
        }
        return getStates(key, _props)

    };


    const updateState = (key, value) => {
        if (onSetStates)
            onSetStates(key, value, 'STATES')
    }

    const updateProp = (key, value) => {
        if (onSetStates)
            onSetStates(key, value, "PROPS")
    }
    return (
        <div id="custom-component">
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

        </div>
    );


};


export default CustomComponent;