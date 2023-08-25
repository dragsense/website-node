
import React, { useEffect, useMemo } from "react";

import ElementSetting from "./ElementSetting";

import loadable from "@loadable/component";

const CustomComponent = (props) => {

    const { children, customPath, node, _states, _props, AutocodeCustom, onUpdateStates, mapValue, mapIndex } = props;


    const loadComponent = async (path) => {
    }; <div>This component is Loading...</div>,

        useEffect(() => {
            loadComponent(customPath);
        }, [])

    const states = useMemo(() => {
        if (!_states) {
            return {};
        }

        return Object.keys(_states).reduce((accumulator, key) => {
            accumulator[key] = _states[key].defaultValue;
            return accumulator;
        }, {});

    }, [_states]);

    const computedProps = useMemo(() => {
        if (!_props) {
            return {};
        }

        return Object.keys(_props).reduce((accumulator, key) => {
            accumulator[key] = _props[key].defaultValue;
            return accumulator;
        }, {});
    }, [_props]);

    const updateStates = (key, value, type) => {
        if (onUpdateStates)
            onUpdateStates(key, value, type)
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
            >
                {AutocodeCustom ? <AutocodeCustom name={customPath} states={states} props={computedProps} updateStates={updateStates}>
                    {children}
                </AutocodeCustom> : children}
            </ElementSetting>

        </div>
    );


};


export default CustomComponent;