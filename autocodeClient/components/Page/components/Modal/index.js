import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

// Function to get transition styles
const getTransitionStyles = (type, duration) => transitions[type].getTransition(duration);

// Function to render modal content
const renderModalContent = (nodeRef, baseStyle, transitionStyles, node, element, children) => {
    return <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>{element(
        { ...node, state: undefined, map: undefined }, children)}</div>;
};

const Modal = ({ children, states, element, node }) => {
    const nodeRef = useRef(null);

    // Get default values from states
    const openModal = getDefaultValue(states, 'openModal', 'close');
    const type = getDefaultValue(states, 'type', 'fade');
    const duration = getDefaultValue(states, 'duration', 300);
    const zIndex = getDefaultValue(states, 'zIndex', 1000);

    // Get transition styles
    const modalTransition = getTransitionStyles(type, duration);

    // Base style for modal
    const baseStyle = useMemo(() => ({
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: zIndex,
        width: '100%',
        height: '100%',
        ...modalTransition.defaultStyles,
    }), [zIndex, modalTransition]);

    return <Transition nodeRef={nodeRef} in={openModal === 'open'} timeout={duration}>
        {state => {
            const transitionStyles = modalTransition[state];
            return renderModalContent(nodeRef, baseStyle, transitionStyles, node, element, children);
        }}
    </Transition>
};

export default React.memo(Modal);

const transitions = {
    fade: {
        getTransition: (duration = 300) => {
            const defaultStyles = {
                transition: `opacity ${duration}ms ease-in-out`,
                opacity: 0,
                pointerEvents: 'none'
            };

            const entering = { opacity: 1 };
            const entered = { opacity: 1, pointerEvents: 'auto' };
            const exiting = { opacity: 0 };
            const exited = { opacity: 0, pointerEvents: 'none' };

            return { defaultStyles, entering, entered, exiting, exited };
        },
    },
    slideRight: {
        getTransition: (duration = 300) => {
          const defaultStyles = {
            transition: `transform ${duration}ms ease-in-out`,
            transform: 'translateX(100%)',
            pointerEvents: 'none',
          };
    
          const entering = { transform: 'translateX(0)' };
          const entered = { transform: 'translateX(0)', pointerEvents: 'auto' };
          const exiting = { transform: 'translateX(100%)' };
          const exited = { transform: 'translateX(100%)', pointerEvents: 'none' };
    
          return { defaultStyles, entering, entered, exiting, exited };
        },
      },
      slideLeft: {
        getTransition: (duration = 300) => {
          const defaultStyles = {
            transition: `transform ${duration}ms ease-in-out`,
            transform: 'translateX(-100%)',
            pointerEvents: 'none',
          };
    
          const entering = { transform: 'translateX(0)' };
          const entered = { transform: 'translateX(0)', pointerEvents: 'auto' };
          const exiting = { transform: 'translateX(-100%)' };
          const exited = { transform: 'translateX(-100%)', pointerEvents: 'none' };
    
          return { defaultStyles, entering, entered, exiting, exited };
        },
      },
      slideTop: {
        getTransition: (duration = 300) => {
          const defaultStyles = {
            transition: `transform ${duration}ms ease-in-out`,
            transform: 'translateY(-100%)',
            pointerEvents: 'none',
          };
    
          const entering = { transform: 'translateY(0)' };
          const entered = { transform: 'translateY(0)', pointerEvents: 'auto' };
          const exiting = { transform: 'translateY(-100%)' };
          const exited = { transform: 'translateY(-100%)', pointerEvents: 'none' };
    
          return { defaultStyles, entering, entered, exiting, exited };
        },
      },
      slideBottom: {
        getTransition: (duration = 300) => {
          const defaultStyles = {
            transition: `transform ${duration}ms ease-in-out`,
            transform: 'translateY(100%)',
            pointerEvents: 'none',
          };
    
          const entering = { transform: 'translateY(0)' };
          const entered = { transform: 'translateY(0)', pointerEvents: 'auto' };
          const exiting = { transform: 'translateY(100%)' };
          const exited = { transform: 'translateY(100%)', pointerEvents: 'none' };
    
          return { defaultStyles, entering, entered, exiting, exited };
        },
      },
};



