import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Tabs component
const Tabs = (props) => {
    const { children, element, nodes, node } = props;

    // Function to flatten children
    const flattenChildren = useCallback((children) => {
        if (!children) {
            return [];
        }
        return React.Children.toArray(children);
    }, []);

    // Memoized flattened children
    const flattenedChildren = useMemo(() => flattenChildren(children), [children, flattenChildren]);

    // Function to clone children with additional props
    const cloneChildren = useCallback((flattenedChildren) => {
        return React.Children.map(flattenedChildren, (child, index) => React.cloneElement(child, {
            key: child.props?.key,
            node: {
                ...child.props.node,
                state: undefined, map: undefined,
            },
            mapNodes: nodes
        }));
    }, [nodes]);

    // Memoized tabs
    const tabs = useMemo(
        () => element(
            { ...node, state: undefined, map: undefined },
            cloneChildren(flattenedChildren)
        ),
        [flattenedChildren, node, element, cloneChildren]
    );



    return (
        <>
            {tabs}
        </>
    );
};

export default Tabs;

