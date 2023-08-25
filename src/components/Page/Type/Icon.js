
import React, { Children, useMemo } from 'react';

const Icon = ({  onClick, value, layout, children }) => {



    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onClick,
            dangerouslySetInnerHTML:{ __html: layout === 'svg-icon' ? value : '' },
        }
    });


    return clonedElement;


};

export default Icon;