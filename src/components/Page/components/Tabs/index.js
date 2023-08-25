import React, { useState, useEffect, useMemo } from 'react';



const Tabs = (props) => {
    const { children,
        element,
        nodes,
        node,
    } = props;



    const flattenedChildren = useMemo(() => {
        if (!children) {
            return [];
        }
        const flattenedChildren = React.Children.toArray(children);
        return flattenedChildren;

    }, [nodes, children]);



    const tabs = useMemo(
        () =>
            element(
                { ...node, state: undefined, map: undefined },
                React.Children.map(flattenedChildren, (child, index) => React.cloneElement(child, {
                    node: {
                        ...child.props.node,
                        state: undefined, map: undefined,
                    },
                    mapNodes: nodes
                }))

            ),
        [flattenedChildren]
    );

    return tabs;


};

export default Tabs;

