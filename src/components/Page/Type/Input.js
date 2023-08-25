
import React, { useEffect, useMemo, useState } from 'react';

const Input = (props) => {
    const {  onChange, value, children } = props;

    const [v, setV] = useState(value);

    const onChangeValue = (e) => {
        e.preventDefault();

        if(onChange) {
        onChange(e.target.value);
        }
        else
        setV(e.target.value);

    }


    useEffect(() => {
        setV(value);
    }, [value])


    // const InputElement = <div style={{ display: 'inline-block' }}><div data-id={_uid}
    //     data-pos={pos} draggable={false} style={{
    //         outline: '1px dashed #bdbdbd', cursor: 'pointer',
    //         padding: '10px',
    //         borderRadius: 5,
    //         display: 'inherit',
    //     }} className="ac-000-yrbQEpZzT">
     
    //     {}


    // </div>
    // </div>

    return React.cloneElement(children, { customAttributes: { 
        onChange: onChangeValue, value: v } });

};

export default Input;