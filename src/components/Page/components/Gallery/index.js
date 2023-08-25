import React, { useState, useEffect, useMemo } from 'react';

const Gallery = ({ children,
    states,
    nodes,
    element,
    node,
    updateStates
}) => {
    
    const total = states['total'] ? states['total'].defaultValue : 0;

    const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;
    const activeItem = states['activeItem'] ? states['activeItem'].defaultValue : null;
    const openModal = states['openModal'] ? states['openModal'].defaultValue : 0;

    const modal = states['modal'] ? states['modal'].defaultValue : false;

    const flattenedChildren = useMemo(() => {
        const flattenedChildren =
            nodes.length > 0
                ? nodes.map((mapValue, mapIndex) =>
                    element({ tagName: 'div', state: node.state }, children, mapValue, mapIndex)
                )
                : React.Children.toArray(children);

        const length = flattenedChildren.length;
        if (length !== total) {
            updateStates('items', length, 'states');
        }

        return flattenedChildren;
    }, [children.length, nodes]);

    useEffect(() => {

        updateStates('activeItem', flattenedChildren[activeIndex]);
      

    }, [activeIndex]);

    useEffect(() => {
        if (modal)
            updateStates('openModal', 1);
    }, [activeItem, modal]);

    useEffect(() => {

        if(openModal === 0)
        updateStates('currentIndex', -1);

    }, [openModal]);



    const renderGallery = useMemo(() => {
        const items = [];

        const totalItems = flattenedChildren.length;

        for (let i = 0; i < totalItems; i++) {
            const isActive = activeIndex === i;
            items.push(
                    React.cloneElement(flattenedChildren[i], { mapIndex: i, isActive })
                  

            );
        }


        return items;
    }, [flattenedChildren])

    const galleryItems = useMemo(
        () =>
            element(
                { ...node, state: undefined, map: undefined },
                    renderGallery
               
            ),
        [renderGallery]
    );

    return galleryItems;
};


export default Gallery;