import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

// Function to create menu items
const createMenuItems = (nodes, element, children, node) => {
    return nodes.length > 0
        ? nodes.map((mapValue, mapIndex) =>
        element({ tagName: 'li', state: node.state }, 
        children,
         mapValue, 
         mapIndex))
        : React.Children.toArray(children);
};

const Menu = ({ children, states, nodes, element, node, updateStates }) => {
    // Get default values from states
    const total = getDefaultValue(states, 'total', 0);
    const activeIndex = getDefaultValue(states, 'currentIndex', -1);

    // Create menu items
    const flattenedChildren = useMemo(() => createMenuItems(nodes, element, children, node), [children, nodes]);

    // Update states if total items changed
    useEffect(() => {
        const length = flattenedChildren.length;
        if (length !== total) {
            updateStates('items', length, 'states');
        }
    }, [flattenedChildren.length]);

    // Render menu items
    const renderMenu = useMemo(() => {
        return flattenedChildren.map((child, index) => {
            const isActive = activeIndex === index;
            return React.cloneElement(child, { mapIndex: index, isActive });
        });
    }, [flattenedChildren, activeIndex]);

    // Render menu
    const menu = useMemo(() => element({ ...node, state: undefined, map: undefined }, renderMenu), [renderMenu]);

    return menu;
};

export default React.memo(Menu);
