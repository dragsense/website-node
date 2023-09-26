import React, { useState, useEffect, useRef, useCallback } from 'react';


const Observable = (props) => {
    const { children, states, node, updateStates } = props;
    const ref = useRef();

    const [vValue, setVisibleValue] = useState('')
    const [sTValue, setScrollTopValue] = useState('')
    const [sLValue, setScrollLeftValue] = useState('')

    const [vTValue, setVisibleTopValue] = useState(0)

    // Function to get default value from states
    const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

    const tagName = getDefaultValue(states, 'tagName', 'div');

    const onScroll = getDefaultValue(states, 'onScroll', false);
    const scrollTop = getDefaultValue(states, 'scrollTop', 50);
    const scrollLeft = getDefaultValue(states, 'scrollLeft', 50);
    const scrollTopValue = getDefaultValue(states, 'scrollTopValue', "");
    const scrollLeftValue = getDefaultValue(states, 'scrollLeftValue', "");


    const onVisible = getDefaultValue(states, 'onVisible', false);
    const calculateVisibility = getDefaultValue(states, 'calculateVisibility', false);

    const oneTime = getDefaultValue(states, 'oneTime', false);
    const threshold = getDefaultValue(states, 'threshold', 10 / 100);
    const visibleValue = getDefaultValue(states, 'visibleValue', "");
    const inVisibleValue = getDefaultValue(states, 'inVisibleValue', "");


    // Function to handle scroll event
    const handleScroll = () => {


        const top = window.scrollY || document.documentElement.scrollTop;
        const left = window.scrollX || document.documentElement.scrollLeft;
        if (top > scrollTop)
            setScrollTopValue(scrollTopValue)
        else
            setScrollTopValue('')
        if (left > scrollLeft)
            setScrollLeftValue(scrollLeftValue)
        else
            setScrollLeftValue('')
    };

    useEffect(() => {

        if (!onScroll || typeof window === 'undefined') return;
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }

    }, [onScroll, scrollLeft, scrollTop, scrollTopValue, scrollLeftValue]);

    let observer;

    // Function to handle visibility
    const handleVisibility = () => {
        if (ref.current && onVisible) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                        setVisibleValue(visibleValue);
                        if (oneTime) {
                            observer.disconnect();
                            return;
                        }
                    } else {
                        setVisibleValue(inVisibleValue);
                    }
                });
            }, { threshold: threshold });
            observer.observe(ref.current);
        }
        return () => {
            if (onVisible) {
                observer.disconnect();
            }
        };
    };
    useEffect(() => handleVisibility, [
        visibleValue,
        inVisibleValue,
        onVisible,
        threshold,
        ref.current,
        oneTime]);


    const calculateElementTopVisibility = useCallback(() => {
        if (ref.current) {
        
                const scrollTop = window.scrollY || document.documentElement.scrollTop;

                const viewportHeight = window.innerHeight;
                const rect = ref.current.getBoundingClientRect();
                // Vertical visibility
                const elementTop = rect.top + scrollTop;
                const elementBottom = rect.bottom + scrollTop;

                const visibleTop = Math.max(elementTop, scrollTop);
                const visibleBottom = Math.min(elementBottom, scrollTop + viewportHeight);

                let visibleHeight = visibleBottom - visibleTop;
                visibleHeight = Math.max(visibleHeight, 0);

                const elementHeight = rect.height;
                const visiblePercentageVertical = (visibleHeight / elementHeight) * 100;

                // Assuming onScrollDiffer is a callback prop to parent component
                setVisibleTopValue(visiblePercentageVertical);
            
        }
    }, []);



    useEffect(() => {
        if (!calculateVisibility || typeof window === 'undefined') return;
        window.addEventListener('scroll', calculateElementTopVisibility);
        return () => {
            window.removeEventListener('scroll', calculateElementTopVisibility);
        }
    }, [calculateVisibility, ref.current]);



    useEffect(() => {
        updateStates('updatedVisibleValue', vValue);
    }, [vValue]);

    useEffect(() => {
        updateStates('upatedTopValue', sTValue);
    }, [sTValue]);

    useEffect(() => {
        updateStates('upatedLeftValue', sLValue);
    }, [sLValue]);

    const deAttach = () => {
        if (!oneTime || typeof window === 'undefined') return;
        window.removeEventListener('scroll', calculateElementTopVisibility);

    }

    useEffect(() => {
        window.addEventListener('scroll', calculateElementTopVisibility);
    }, [oneTime])

    useEffect(() => {
        if (vTValue) {
            updateStates('visibleY', vTValue);
            if (vTValue >= 100)
                deAttach();
        }

    }, [vTValue, oneTime]);

    return React.createElement(tagName, { ref }, children)
};

export default Observable;