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
            key: child.props?._uid,
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

    // If no changes in props, disable the button
    const [prevProps, setPrevProps] = useState(props);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    useEffect(() => {
        if (prevProps === props) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
            setPrevProps(props);
        }
    }, [props, prevProps]);

    return (
        <>
            {tabs}
            <button disabled={isButtonDisabled}>Submit</button>
        </>
    );
};

export default Tabs;

