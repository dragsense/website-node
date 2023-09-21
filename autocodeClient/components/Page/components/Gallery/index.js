import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;


const Gallery = ({ children, states, nodes, element, node, updateStates }) => {
    
    // Get default values from states
    const total = getDefaultValue(states, 'total', 0);
    const activeIndex = getDefaultValue(states, 'currentIndex', -1);
    const activeItem = getDefaultValue(states, 'activeItem', null);
    const openModal = getDefaultValue(states, 'openModal', 0);
    const modal = getDefaultValue(states, 'modal', false);

    // Flatten children nodes
    const flattenedChildren = useMemo(() => {
        const flattenedChildren = nodes.length > 0
            ? nodes.map((mapValue, mapIndex) =>
                element({ tagName: 'div', state: node.state }, children, mapValue, mapIndex)
            )
            : React.Children.toArray(children);

        // Update total items if length is different
        const length = flattenedChildren.length;
        if (length !== total) {
            updateStates('items', length);
        }

        return flattenedChildren;
    }, [children.length, nodes]);

    // Update active item on active index change
    useEffect(() => {
        updateStates('activeItem', flattenedChildren[activeIndex]);
    }, [activeIndex]);

    // Open modal on active item or modal change
    useEffect(() => {
        if (modal) {
            updateStates('openModal', 1, 'states');

        }
    }, [activeItem, modal]);

    // Reset current index on modal close
    useEffect(() => {
        if(openModal === 0) {
            updateStates('currentIndex', -1);

        }
    }, [openModal]);

    // Render gallery items
    const renderGallery = useMemo(() => {
        return flattenedChildren.map((child, i) => {
            const isActive = activeIndex === i;
            return React.cloneElement(child, { mapIndex: i, isActive });
        });
    }, [flattenedChildren, activeIndex]);

    // Render gallery
    const galleryItems = useMemo(() => {
        return element({ ...node, state: undefined, map: undefined }, renderGallery);
    }, [renderGallery, node]);

    return galleryItems;
};

export default Gallery;