import React, { useState, useEffect, useRef } from 'react';
import { Transition } from 'react-transition-group';

const GoToTopButton =
    (props) => {
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

        const duration = states['duration'] ? states['duration'].defaultValue : 300;
        const type = states['type'] ? states['type'].defaultValue : 'fade';

        const buttonTransition = transitions[type].getTransition(duration);

        const handleScroll = () => {

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsVisible(scrollTop > 0);
        };

        const scrollToTop = () => {


            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        };

        useEffect(() => {
            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }, []);

        return <Transition nodeRef={nodeRef} in={isVisible} timeout={duration}>
            {state => {
                const baseStyle = {
                    display: 'inline-block',
                    ...buttonTransition.defaultStyles,
                };
                const transitionStyles = buttonTransition[state];
                return <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}
                 onClick={scrollToTop}>
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