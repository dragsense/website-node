import React, { useState, useEffect, useMemo } from 'react';


const TabsButton = (props) => {
    const { children,
        states,
        nodes,
        element,
        node,
        updateStates } = props;

    const total = states['total'] ? states['total'].defaultValue : 0;

    const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;


    const flattenedChildren = useMemo(() => {

        const flattenedChildren = nodes.length > 0 ? nodes.map((mapValue, mapIndex) => element(
            { tagName: 'span', state: node.state },
            children[0],
            mapValue,
            mapIndex,
        ))
            :
            React.Children.toArray(children);
        const length = flattenedChildren.length;
        if (length !== total)
            updateStates('items', length, 'states');
        return flattenedChildren;

    }, [children.length, nodes]);



    const renderTabsButton = useMemo(() => {
        const tabsButton = [];
        const totalSlides = flattenedChildren.length;
        for (let i = 0; i < totalSlides; i++) {
            const isActive = activeIndex === i;
            tabsButton.push(React.cloneElement(flattenedChildren[i], { mapIndex: i, isActive }));
        }

        return tabsButton;
    }, [flattenedChildren])

    const tabsButton = useMemo(
        () =>
            element(
                { ...node, state: undefined, map: undefined },
                renderTabsButton

            ),
        [renderTabsButton]
    );

    return tabsButton;


};

export default TabsButton;

