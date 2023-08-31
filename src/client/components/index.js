const React = require("react");

import ComplexLogics from './ComplexLogics';


export default function AutocodeCustom({ children, name, states, props, updateStates }) {


    switch (name) {
        case 'ComplexLogics':
            return <ComplexLogics states={states} props={props} updateStates={updateStates}>{children}</ComplexLogics>
        default:
        return name;
    }
}

