const React = require("react");

import { useEffect, useMemo, useState, useCallback } from 'react';

// InputGroup component
const InputGroup = (props) => {
    const { labelPos, onChange, conds,
        attributes, type, mapValue, value } = props;

    // Option value and label
    const option = useMemo(() => mapValue ? { value: mapValue.value, label: mapValue.label || mapValue.value } : { value: '' }, [mapValue]);

    // State for checked status
    const [checked, setChecked] = useState(false);

    // Function to handle value change
    const handleValueChange = useCallback((e) => {
        e.preventDefault();
        const optionValue = e.target.value;
        let newValue = '';

        // Logic for checked status
        if (checked) {
            newValue = handleCheckedStatus(type, value, optionValue);
        }
        else {
            newValue = handleUncheckedStatus(type, value, optionValue);
        }

        // Debounce onChange function
        if (onChange) {
           onChange(newValue, optionValue === 'all')
        }

        // Toggle checked status
        setChecked(!checked);
    }, [checked, onChange]);

    // Function to handle checked status
    const handleCheckedStatus = (type, value, optionValue) => {
        let newValue = '';
        if (type === 'radio' || !value)
            newValue = "''"
        else {
            const valuesArray = String(value).split(",");
            newValue = valuesArray.filter(v => v !== optionValue).join(",");
            if (newValue === 'all')
                newValue = '';
        }
        return newValue;
    };

    // Function to handle unchecked status
    const handleUncheckedStatus = (type, value, optionValue) => {
        let newValue = '';
        if (type === 'radio' || !value)
            newValue = optionValue;
        else {
            newValue = value + "," + optionValue;
            if(optionValue === 'all')
            newValue = 'all';
        }
        return newValue;
    };

    // Effect to handle checked status
    useEffect(() => {
        let isChecked = false;

        isChecked = handleIsChecked(value, type, option);

        setChecked(isChecked);
    }, [value, type, option]);

    // Function to handle isChecked status
    const handleIsChecked = (value, type, option) => {
        let isChecked = false;
        if (typeof value === 'string') {
            isChecked = type === 'radio'
                ? value === option.value || (option.value === 'all' && value.includes('all'))
                : value.split(',').some(v => v === option.value);
        } else if (typeof value === 'boolean') {
            isChecked = value === (option.value.toLowerCase() === 'true'); // Convert string to boolean
        } else if (!isNaN(Number(value))) { // Check if value is a number
            isChecked = Number(value) === Number(option.value); // Convert string to number
        }
        return isChecked;
    };

    // Input element
    const input = <>{labelPos == 0 && option.label}<input key={checked} type={type} {...attributes}
        onClick={handleValueChange}
        value={option.value}
        checked={checked === true} />  {labelPos == 1 && option.label}</>



    // Return disabled or cloned element based on disabled state
    return conds ? input : null;
};

export default InputGroup;