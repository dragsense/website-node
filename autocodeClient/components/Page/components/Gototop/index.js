import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Transition } from 'react-transition-group';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

// Function to handle scroll
const handleScroll = (window, setIsVisible) => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsVisible(scrollTop > 0);
};

// Function to scroll to top
const scrollToTop = (window) => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

// Function to get transition
const getTransition = (transitions, type, duration) => transitions[type].getTransition(duration);

const GoToTopButton = (props) => {
    const {
        children,
        states,
        element,
        node,
    } = props;

    const [isVisible, setIsVisible] = useState(false);
    const nodeRef = useRef(null);

    const iframe = document.querySelector("#ac-editor-iframe-doc");
    const window = iframe.contentWindow;

    const duration = getDefaultValue(states, 'duration', 300);
    const type = getDefaultValue(states, 'type', 'fade');

    const buttonTransition = getTransition(transitions, type, duration);

    const handleScrollCallback = useCallback(() => handleScroll(window, setIsVisible), [window, setIsVisible]);
    const scrollToTopCallback = useCallback(() => scrollToTop(window), [window]);

    useEffect(() => {
        window.addEventListener('scroll', handleScrollCallback);
        return () => {
            window.removeEventListener('scroll', handleScrollCallback);
        };
    }, [handleScrollCallback]);

    return <Transition nodeRef={nodeRef} in={isVisible} timeout={duration}>
        {state => {
            const baseStyle = {
                display: 'inline-block',
                ...buttonTransition.defaultStyles,
            };
            const transitionStyles = buttonTransition[state];
            return <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}
             onClick={scrollToTopCallback}>
                {element(node, children)}
            </div>;

        }}
    </Transition>
};

const transitions = {
    slide: {
        getTransition: (duration = 300, index) => {
            const defaultStyles = {
                transition: `transform ${duration}ms ease-in-out`,
            };

            const entering = {
                transform: 'translateX(0%)',
            };

            const entered = {
                transform: 'translateX(0%)',
            };

            const exiting = {
                transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
            };

            const exited = {
                transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
            };

            return { defaultStyles, entering, entered, exiting, exited };
        },
    },
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

export default GoToTopButton;