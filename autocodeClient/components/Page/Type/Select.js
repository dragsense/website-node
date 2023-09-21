const React = require("react");

import  { useEffect, useMemo, useRef, useState } from 'react';

// Function to handle onChange event
const handleOnChange = (e, onChange) => {


    let selectedValues = Array.from(e.target.selectedOptions).map(option => option.value);

    if (selectedValues.includes("all"))
        selectedValues = ['all'];



    onChange(selectedValues.join(','), selectedValues.includes("all"));
}

// Function to handle useEffect
const handleUseEffect = (value, ref) => {
    if (!ref.current)
        return;

    if (typeof value === 'string') {
        const selectElement = ref.current;
        const selectedOptions = value.split(',');
        if (selectElement) {
            const optionsLength = selectElement.options.length;
            const selectedLength = selectedOptions.length;

            if (selectedLength > 0) {
                for (let i = optionsLength - 1; i > -1; i--) {
                    selectElement.options[i].selected = selectedOptions.includes(selectElement.options[i].value);
                }
            }
        }
    }
}

const Select = (props) => {
    const { onChange, pos, value, _uid, onClick, disabled, conds, children, innerWraaper } = props;

    const ref = useRef(null);
    const [values, setValues] = useState('');

    const onChangeValue = (e) => {


        if (onChange)
        handleOnChange(e, onChange)
            //debounce(() => handleOnChange(e, onChange), 300)
    }

    useEffect(() => {
        handleUseEffect(value, ref);
    }, [value, ref.current])

 
    const SelectElement = React.cloneElement(children, { customAttributes: { ref, onChange: onChangeValue } }, innerWraaper)

    return conds ? SelectElement : null;

};

export default Select;