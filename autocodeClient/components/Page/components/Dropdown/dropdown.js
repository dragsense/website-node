const React = require("react");

import { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

// Define the possible sides for the dropdown
const SIDES = [
    'topRight',
    'topLeft',
    'bottomLeft',
    'bottomRight',
];

// Dropdown component
const Dropdown = ({ 
    children, 
    type,
    duration,
    openSide,
    openDropdown,
    closeDropdown,
    expandable,
    leftOffset,
    topOffset,
    initialValue, expandValue }) => {

  const nodeRef = useRef(null);

// Determine the transition type based on whether the dropdown is expandable
  const transitionType = useMemo(() => expandable ? type : 'fade', [expandable, type]);

// Get the transition for the dropdown
  const dropdownTransition = useMemo(() => transitions[transitionType].getTransition(duration, initialValue, expandValue), [transitionType, duration, initialValue, expandValue]);


// Handle click outside of dropdown to close it
  const handleClickOutside = (event) => {
    if (nodeRef.current && !nodeRef.current.contains(event.target)) {
      closeDropdown();
    }
  };

// Add event listener for clicks outside of dropdown
  useEffect(() => {

    if (typeof window === 'undefined') return;


    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown, handleClickOutside]);

// Render the dropdown with the appropriate transition and styles
  return (
    <Transition nodeRef={expandable} in={openDropdown} timeout={duration}>
      {state => {
        const baseStyle = {
          position: expandable ? 'relative' : 'absolute',
          [openSide]: 0,
          visibility:  openDropdown ? 'visible' : 'hidden',
          left: openSide.includes('Left') ? leftOffset : 'auto',
          right: openSide.includes('Right') ? leftOffset : 'auto',
          top: openSide.includes('top') ? topOffset : 'auto',
          bottom: openSide.includes('bottom') ? topOffset : 'auto',
          width: 'auto',
          height: 'auto',
          ...dropdownTransition.defaultStyles,
        };
        const transitionStyles =  dropdownTransition[state];
        return (
          <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>
            {children}
          </div>
        );
      }}
    </Transition>
  );
};

// Define the transitions for the dropdown
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

  expandRight: {
    getTransition: (duration = 300, initialValue, expandValue) => {
      const defaultStyles = {
        transition: `width ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
        width: initialValue,
        opacity: 0,
      };

      const entering = { width: expandValue, opacity: 1 };
      const entered = { width: expandValue, opacity: 1 };
      const exiting = { width: initialValue, opacity: 0 };
      const exited = { width: initialValue, opacity: 0 };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
 
  expandBottom: {
    getTransition: (duration = 300, initialValue, expandValue) => {
      const defaultStyles = {
        transition: `height ${duration}ms ease-in-out,  opacity ${duration}ms ease-in-out`,
        height: initialValue
      };

      const entering = { height: expandValue, opacity: 1 };
      const entered = { height: expandValue, opacity: 1 };
      const exiting = { height: initialValue, opacity: 0 };
      const exited = { height: initialValue, opacity: 0 };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
};

export default Dropdown;
