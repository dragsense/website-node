
import React, { Children, useMemo } from 'react';

const General = ({  onClick, innerWraaper, value, children }) => {


    const spanElement = !innerWraaper ? [] : ([<>
        {React.isValidElement(value) ? value : value && <span
            dangerouslySetInnerHTML={{ __html: value }}
        />
        }
        {innerWraaper}</>
    ]);

    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            onClick: onClick
        }
    }, spanElement);


    return clonedElement;


};

export default General;