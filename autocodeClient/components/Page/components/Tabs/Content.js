import React, { useState, useEffect, useMemo } from 'react';
import Tab from './Tab';

// Function to get active index and duration
const getActiveIndexAndDuration = (states) => {
    const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;
    const duration = states['duration'] ? states['duration'].defaultValue : 300;
    return { activeIndex, duration };
}


const TabsContent = (props) => {
    const { children, states, nodes, element, node } = props;

    // Get active index and duration
    const { activeIndex, duration } = getActiveIndexAndDuration(states);


    // Function to flatten children
    const flattenedChildren = useMemo(() => {
        return nodes.length > 0 ? nodes.map((mapValue, mapIndex) => element(
            { tagName: 'div', state: node.state },
            children[0],
            mapValue,
            mapIndex,
        ))
            :
            React.Children.toArray(children);
    }, [children.length, nodes]);



        // Function to render tabs content
        const renderTabsContent = useMemo(() => {
            const tabsContent = [];
            const totalSlides = flattenedChildren.length;
            for (let i = 0; i < totalSlides; i++) {
                const isActive = activeIndex === i;
                tabsContent.push(<Tab isActive={isActive} zIndex={totalSlides - i} duration={duration}>{flattenedChildren[i]}</Tab>)
            }
            return tabsContent;
        }, [flattenedChildren, activeIndex, duration]);


    // Memoize tabs content
    const tabsContent = useMemo(
        () =>
            element(
                { ...node, state: undefined, map: undefined },
                <div _uid={node._uid} style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                    {renderTabsContent}
                </div>

            ),
        [renderTabsContent]
    );

    return tabsContent;
};

export default TabsContent;

