import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

// Define transitions for fade effect
const transitions = {
    fade: {
      getTransition: (duration = 300) => {
        const defaultStyles = {
          transition: `opacity ${duration}ms ease-in-out`,
          opacity: 0,
        };
        const entering = { opacity: 1 };
        const entered = { opacity: 1 };
        const exiting = { opacity: 0 };
        const exited = { opacity: 0 };
  
        return { defaultStyles, entering, entered, exiting, exited };
      },
    },
};

// Function to get base style
const getBaseStyle = (isActive, tabsTransition) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: isActive ? 1 : -1,
    width: '100%',
    height: '100%',
    ...tabsTransition.defaultStyles,
});

// Function to render children with transition styles
const renderChildren = (state, nodeRef, baseStyle, tabsTransition, children) => {
    const transitionStyles =  tabsTransition[state];
    return (
        <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>
            {children}
        </div>
    );
};

const Tab = ({children, isActive, zIndex, duration}) => {
    const nodeRef = useRef(null);
    const tabsTransition = transitions["fade"].getTransition(duration);
    const baseStyle = getBaseStyle(isActive, tabsTransition);

    // useMemo to optimize performance by memoizing the output of renderChildren
    const renderChildrenMemo = useMemo(() => renderChildren, [isActive, zIndex, duration, children]);

    return (
        <Transition nodeRef={nodeRef} in={isActive} timeout={duration}>
            {state => renderChildrenMemo(state, nodeRef, baseStyle, tabsTransition, children)}
        </Transition>
    );
};

export default Tab;