
import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from '../../../utils/utils'

const Input = (props) => {



    const {  onChange, value,

        onClick, children, conds } = props;

    const [v, setV] = useState(value);

    const onChangeValue = (e) => {
        e.preventDefault();



        const v = e.target.value;
        if (onChange) {
            debounce(onChange(v), 500)

        }
        setV(v);

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

    const InputElement = React.cloneElement(children, {
        customAttributes: {

      
            onClick: onClick,
            onChange: onChangeValue, value: v
        }
    });

 


    return conds ? InputElement : null;



};

export default Input;