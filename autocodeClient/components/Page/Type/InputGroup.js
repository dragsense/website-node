
import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from '../../../utils/utils'

const InputGroup = (props) => {
    const { labelPos, onChange, conds,
        attributes, type, mapValue, disabled, onClick, value, _uid, pos, children } = props;

    const option = mapValue ? { value: mapValue.value, label: mapValue.label || mapValue.value } : { value: '' };

    const [checked, setChecked] = useState(false);

    const onChangeValue = (e) => {
        e.preventDefault();
        const optionValue = e.target.value;
        let newValue = '';

        if (checked) {
            if (type === 'radio' || !value)
                newValue = "''"
            else {
                const valuesArray = String(value).split(",");
                newValue = valuesArray.filter(v => v !== optionValue).join(",");
                if (newValue === 'all')
                    newValue = '';
            }
        }
        else {
            if (type === 'radio' || !value)
                newValue = optionValue;
            else {
                newValue = value + "," + optionValue;
                if(optionValue === 'all')
                newValue = 'all';

            }
        }

        if (onChange) {
            debounce(onChange(newValue, optionValue === 'all'), 500)
        }
        setChecked(!checked);


    }


    useEffect(() => {
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

        setChecked(isChecked);
    }, [value]);

    const input = <>{labelPos == 0 && option.label}<input key={checked} type={type} {...attributes}

        onClick={onChangeValue}
        value={option.value}
        checked={checked === true} />  {labelPos == 1 && option.label}</>

    const disabledStyles = {
        opacity: 0.2,
        border: '1px dashed #ccc',
    };

    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onClick: onClick,

            "data-id": _uid,
            "data-pos": pos,
            "draggable": false,
            style: { ...(conds ? {} : disabledStyles), outline: '1px dotted #bdbdbd', cursor: 'pointer', paddingInline: '1%', }
        }
    }, input);




    const disabledElement = React.cloneElement(children, {
        customAttributes: {

            onClick: onClick,
            style: conds ? {} : disabledStyles
        }
    });


    return disabled ? disabledElement : clonedElement;


};

export default InputGroup;