import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Function to get total and active index
const getTotalAndActiveIndex = (states) => {
    const total = states['total'] ? states['total'].defaultValue : 0;
    const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;
    return { total, activeIndex };
}

// Function to flatten children
const getFlattenedChildren = (nodes, element, node, children, total, updateStates) => {
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
};

// Function to render tabs button
const getRenderTabsButton = (flattenedChildren, activeIndex) => {
    const tabsButton = [];
    const totalSlides = flattenedChildren.length;
    for (let i = 0; i < totalSlides; i++) {
        const isActive = activeIndex === i;
        tabsButton.push(React.cloneElement(flattenedChildren[i], { mapIndex: i, isActive }));
    }
    return tabsButton;
};

const TabsButton = (props) => {
    const { children,
        states,
        nodes,
        element,
        node,
        updateStates } = props;

    const { total, activeIndex } = getTotalAndActiveIndex(states);

    const flattenedChildren = useMemo(() => getFlattenedChildren(nodes, element, node, children, total, updateStates), [children.length, nodes]);

    const renderTabsButton = useMemo(() => getRenderTabsButton(flattenedChildren, activeIndex), [flattenedChildren])

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

