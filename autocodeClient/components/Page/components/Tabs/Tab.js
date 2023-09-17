import React, { useState, useEffect, useMemo, useRef } from 'react';


import { Transition } from 'react-transition-group';

const Tab = ({children, isActive, zIndex, duration}) => {
    const nodeRef = useRef(null);

  const tabsTransition = transitions["fade"].getTransition(duration);
  return (
    <Transition nodeRef={nodeRef} in={isActive} timeout={duration}>
      {state => {
        const baseStyle = {
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: isActive ? 1 : -1,
          width: '100%',
          height: '100%',
          ...tabsTransition.defaultStyles,
        };
        const transitionStyles =  tabsTransition[state];
        return (
          <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>
            {children}
          </div>
        );
      }}
    </Transition>
  );
};

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
  

export default Tab;