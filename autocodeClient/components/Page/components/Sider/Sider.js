import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

// Function to get transition styles
const getTransitionStyles = (type, duration, initialValue, expandValue) => {
  return transitions[type].getTransition(duration, initialValue, expandValue);
};

// Function to render children with transition styles
const renderChildrenWithStyles = (children, baseStyle, transitionStyles) => {
  return (
    <div style={{ ...baseStyle, ...transitionStyles }}>
      {children}
    </div>
  );
};

const Slider = ({ children, openSider, duration, type, initialValue, expandValue }) => {
  const nodeRef = useRef(null);
  const [prevType, setPrevType] = useState(type);

  // Memoize transition styles for performance
  const sliderTransition = useMemo(() => getTransitionStyles(type, duration, initialValue, expandValue), [type, duration, initialValue, expandValue]);

  // Update transition styles if type changes
  useEffect(() => {
    if (type !== prevType) {
      setPrevType(type);
      sliderTransition = getTransitionStyles(type, duration, initialValue, expandValue);
    }
  }, [type]);

  return (
    <Transition nodeRef={nodeRef} in={openSider} timeout={duration}>
      {state => {
        const baseStyle = {
          width: '100%',
          ...sliderTransition.defaultStyles,
        };
        const transitionStyles =  sliderTransition[state];
        return renderChildrenWithStyles(children, baseStyle, transitionStyles);
      }}
    </Transition>
  );
};

const transitions = {

  expandRight: {
    getTransition: (duration = 300, initialValue, expandValue) => {
      const defaultStyles = {
        transition: `width ${duration}ms ease-in-out`,
        width: initialValue
      };

      const entering = { width: expandValue };
      const entered = { width: expandValue };
      const exiting = { width: initialValue };
      const exited = { width: initialValue };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
 
  expandBottom: {
    getTransition: (duration = 300, initialValue, expandValue) => {
      const defaultStyles = {
        transition: `height ${duration}ms ease-in-out`,
        height: initialValue
      };

      const entering = { height: expandValue };
      const entered = { height: expandValue };
      const exiting = { height: initialValue };
      const exited = { height: initialValue };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
};


export default Slider;
