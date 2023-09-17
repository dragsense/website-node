
import React, { useMemo } from 'react';

const CloseTag = (props) => {
    const {  children, conds,
        onMouseMove,
        
        onClick, } = props;

    const CloseElement = React.cloneElement(children, {
        customAttributes: {
            onMouseMove: onMouseMove,
            onClick: onClick,

        }
    })

   

    return conds ? CloseElement : null;


};

export default CloseTag;