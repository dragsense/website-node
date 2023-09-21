import React, { useState, useEffect, useRef, useMemo } from 'react';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

// Function to handle scroll event
const handleScroll = (onScroll, scrollTop, scrollLeft, scrollTopClass, scrollLeftClass, setTopClasses, setLeftClasses) => {
    if (onScroll) {
        const iframe = document.querySelector("#ac-editor-iframe-doc");
        if (iframe) {
            const iframeWindow = iframe.contentWindow;
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            const top = iframeWindow.pageYOffset || iframeDocument.documentElement.scrollTop;
            const left = iframeWindow.pageXOffset || iframeDocument.documentElement.scrollLeft;
            if (top > scrollTop)
                setTopClasses({ name: scrollTopClass })
            else
                setTopClasses({})
            if (left > scrollLeft)
                setLeftClasses({ name: scrollLeftClass })
            else
                setLeftClasses({})
        }
    }
};

// Function to handle visibility
const handleVisibility = (onVisible, visible, visibleClass, inVisibleClass, setVisibleClasses, oneTime, ref) => {
    let observer;
    if (ref.current && onVisible) {
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && entry.intersectionRatio >= visible) {
                    setVisibleClasses({ name: visibleClass });
                    if (oneTime) {
                        observer.disconnect();
                        return;
                    }
                } else {
                    setVisibleClasses({ name: inVisibleClass });
                }
            });
        }, { threshold: visible });
        observer.observe(ref.current);
    }
    return () => {
        if (onVisible) {
            observer.disconnect();
        }
    };
};

const Observable = (props) => {
    const { children, states, element, node } = props;
    const ref = useRef();
    const [topClass, setTopClasses] = useState({});
    const [leftClass, setLeftClasses] = useState({});
    const [visibleCls, setVisibleClasses] = useState({ name: getDefaultValue(states, 'inVisibleClass', "") });

    const tagName = getDefaultValue(states, 'tagName', 'div');
    const onScroll = getDefaultValue(states, 'onScroll', false);
    const onVisible = getDefaultValue(states, 'onVisible', false);
    const scrollTop = getDefaultValue(states, 'scrollTop', 50);
    const scrollLeft = getDefaultValue(states, 'scrollLeft', 50);
    const scrollTopClass = getDefaultValue(states, 'scrollTopClass', "");
    const scrollLeftClass = getDefaultValue(states, 'scrollLeftClass', "");
    const oneTime = getDefaultValue(states, 'oneTime', false);
    const visible = getDefaultValue(states, 'visible', 10 / 100);
    const visibleClass = getDefaultValue(states, 'visibleClass', "");
    const inVisibleClass = getDefaultValue(states, 'inVisibleClass', "");

    useEffect(() => handleVisibility(onVisible, visible, visibleClass, inVisibleClass, setVisibleClasses, oneTime, ref), [visibleClass, onVisible, visible, ref.current, oneTime]);
    useEffect(() => handleScroll(onScroll, scrollTop, scrollLeft, scrollTopClass, scrollLeftClass, setTopClasses, setLeftClasses), [onScroll, scrollLeft, scrollTop, scrollTopClass, scrollLeftClass]);

    const getClasses = () => {
        let classes = node.classes || {};
        if (topClass?.name)
            classes['topClass'] = topClass;
        else
            delete classes['topClass']
        if (leftClass?.name)
            classes['leftClass'] = leftClass;
        else
            delete classes['leftClass']
        if (visibleCls?.name)
            classes['visibleCls'] = visibleCls;
        else
            delete classes['visibleCls']
        return classes;
    }

    const observableItem = useMemo(() => element({ ...node, tagName, classes: getClasses(), state: undefined, map: undefined }, children), [children, topClass, tagName, leftClass, visibleCls]);

    return <span style={{ display: 'inline' }} ref={ref}>{observableItem}</span>;
};

export default Observable;