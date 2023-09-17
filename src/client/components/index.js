const React = require("react");

import ComplexLogics from './ComplexLogics';


export default function AutocodeCustom({ children, name, getStateValue, getPropValue, updateProp, updateState }) {

console.log(name)
    switch (name) {
        case 'ComplexLogics':
            return <ComplexLogics 
                getStateValue={getStateValue}
                getPropValue={getPropValue}
                updateProp={updateProp}
                updateState={updateState}>
                {children}</ComplexLogics>
        default:
            return name;
    }
}

