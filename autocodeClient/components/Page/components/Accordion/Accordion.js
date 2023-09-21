const React = require("react");

import { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

// Define transitions for accordion
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
    expand: {
        getTransition: (duration = 300) => {
            const defaultStyles = {
                transition: `height ${duration}ms ease-in-out`,
                height: 0,
            };
            const entering = { height: 0 };
            const entered = { height: 100 };
            const exiting = { height: 100 };
            const exited = { height: 0 };

            return { defaultStyles, entering, entered, exiting, exited };
        },
    },
};

// Function to flatten children
const flattenChildren = (children) => {
    return React.Children.toArray(children);
}

// Function to get transition styles
const getTransitionStyles = (state, accordionTransition) => {
    const baseStyle = {
        width: '100%',
        overflow: 'hidden',
        ...accordionTransition.defaultStyles,
    };
    const transitionStyles = accordionTransition[state];
    return { ...baseStyle, ...transitionStyles };
}

const Accordion = (props) => {
    const { children, isActive, duration } = props;

    // Use useRef for performance optimization
    const nodeRef = useRef(null);

    // Use useMemo for performance optimization
    const accordionTransition = useMemo(() => transitions["expand"].getTransition(duration), [duration]);

    // Use useMemo for performance optimization
    const flattenedChildren = useMemo(() => flattenChildren(children), [children]);

    return (
        <>
            {flattenedChildren[0]}
            <Transition nodeRef={nodeRef} in={isActive} timeout={duration}>
                {state => {
                    const transitionStyles = getTransitionStyles(state, accordionTransition);
                    return (
                        <div ref={nodeRef} style={transitionStyles}>
                            {flattenedChildren[1]}
                        </div>
                    );
                }}
            </Transition>
        </>
    );
};

export default Accordion;