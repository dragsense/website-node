import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Transition } from 'react-transition-group';


const Accordion = (props) => {
    const { children, isActive, duration } = props;

    const nodeRef = useRef(null);

    const accordionTransition = transitions["expand"].getTransition(duration);

    const flattenedChildren = React.Children.toArray(children);

    return <>
        {flattenedChildren[0]}
        <Transition nodeRef={nodeRef} in={isActive} timeout={duration}>
            {state => {
                const baseStyle = {
                    width: '100%',
                    overflow: 'hidden',
                    ...accordionTransition.defaultStyles,
                };
                const transitionStyles = accordionTransition[state];
                return (
                    <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>
                        {flattenedChildren[1]}
                    </div>
                );
            }}
        </Transition>

    </>
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


export default Accordion;