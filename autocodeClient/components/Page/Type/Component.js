
import React, { Children, useMemo } from 'react';



const Component = ({
  
    onMouseMove,
    conds,
    onScroll,
    onClick,
    innerWraaper,
    value,
    children,
    }) => {


 

    const spanElement = innerWraaper ? (<>
        {React.isValidElement(value) ? value : <div
            dangerouslySetInnerHTML={{ __html: value }}
         
        />
        }
        {innerWraaper}</>
    ) : <span style={{ userSelect: 'none', color: "#cccccc" }}></span>;



    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onMouseMove: onMouseMove,
            onScroll: onScroll,
            onClick: onClick
        }
    }, spanElement);




   


    return conds ? clonedElement : null;


};

export default Component;