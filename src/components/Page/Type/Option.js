
import React, { useMemo } from 'react';

const Option = (props) => {
    const { mapValue, mapIndex, value, children } = props;


    const option = mapValue ? {value: mapValue.value, label: mapValue.label || mapValue.value} : 
    { value, label: value };

    let inputs = React.cloneElement(children, { customAttributes: { 
        value: option.value,
        } },
        [mapValue.label || mapValue.value]
    )


    return inputs;

};

export default Option;