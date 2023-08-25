
import React, { Children, useMemo } from 'react';

const General = ({  onClick, innerWraaper, children }) => {


    const spanElement = !innerWraaper ? [] : innerWraaper;
  
    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onClick: onClick
        }
    }, spanElement);


    return clonedElement;


};

export default General;