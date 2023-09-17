import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

const Modal = ({ children,
    states,
    element,
    node,
}) => {

    const nodeRef = useRef(null);

    const openModal = states['openModal'] ? states['openModal'].defaultValue : 'close';
console.log(openModal)

    const type = states['type'] ? states['type'].defaultValue : 'fade';
    const duration = states['duration'] ? states['duration'].defaultValue : 300;
    const zIndex = states['zIndex'] ? states['zIndex'].defaultValue : 1000;

    const modalTransition = transitions[type].getTransition(duration);


    return <Transition nodeRef={nodeRef} in={openModal === 'open'} timeout={duration}>
        {state => {
            const baseStyle = {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                zIndex: zIndex,
                width: '100%',
                height: '100%',
                ...modalTransition.defaultStyles,
            };
            const transitionStyles = modalTransition[state];
            return <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>{element(
                { ...node, state: undefined, map: undefined }, children)}</div>;

        }}
    </Transition>

};

export default Modal;



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

