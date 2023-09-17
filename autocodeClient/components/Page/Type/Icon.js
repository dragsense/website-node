
import React, { Children, useMemo } from 'react';

const Icon = ({  conds, onMouseMove, onClick, value, layout, children }) => {





    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onClick,
            onMouseMove: onMouseMove,

            dangerouslySetInnerHTML: { __html: layout === 'svg-icon' ? value : '' },
           
        }
    });




    return conds ? clonedElement : null;



};

export default Icon;