const React = require("react");

import { useEffect, useState, useCallback } from 'react';

// Input component
const Input = (props) => {

    const {  onChange, value, type, onClick, children, disabled } = props;

    // State for input value
    const [v, setV] = useState(value);

    // Function to handle input value change
    const onChangeValue = useCallback((e) => {
        e.preventDefault();

        const newValue = e.target.value;
        if (onChange) {
            // Debounce to limit the rate at which function is executing
            onChange(newValue)
        }
        setV(newValue);
    }, [onChange]);

    // Update state when value prop changes
    useEffect(() => {
        setV(value);
    }, [value])

    // Clone children with custom attributes
    const InputElement = React.cloneElement(children, {
        customAttributes: {
   
            onClick: type === 'file' ? undefined : onClick,
            onChange:  onChangeValue, 
            value: v
        }
    });



    // Return disabled or cloned element based on disabled state
    return disabled ? InputElement : null;

};

export default Input;