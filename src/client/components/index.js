const React = require("react");

import ComplexLogics from './ComplexLogics';


export default function AutocodeClient({ children, name, getStateValue, getPropValue, updateProp, updateState }) {

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

