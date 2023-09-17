import React, { useState, useEffect, useMemo } from 'react';


const Menu = ({ children,
    states,
    nodes,
    element,
    node,
    updateStates
}) => {

    const total = states['total'] ? states['total'].defaultValue : 0;
    const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;

    const flattenedChildren = useMemo(() => {
        const flattenedChildren =
        nodes.length > 0
                ? nodes.map((mapValue, mapIndex) =>
                    element({ tagName: 'li', state: node.state }, 
                    children,
                     mapValue, 
                     mapIndex)
                )
                : React.Children.toArray(children);

        const length = flattenedChildren.length;
        if (length !== total) {
            updateStates('items', length, 'states');
        }

        return flattenedChildren;
    }, [children.length, nodes]);

    
    const renderMenu = useMemo(() => {
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

    const menu = useMemo(
        () =>
            element(
                { ...node, state: undefined, map: undefined },
                renderMenu
               
            ),
        [renderMenu]
    );

    return menu;


  
   
};

export default Menu;