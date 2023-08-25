import React, { useState, useEffect, useRef, useMemo } from 'react';

const Observable =
    (props) => {
        const {
            children,
            states,
            element,
            node,
            updateStates
        } = props;

        const ref = useRef();

        const [topClass, setTopClasses] = useState({});
        const [leftClass, setLeftClasses] = useState({});


        const tagName = states['tagName'] ? states['tagName'].defaultValue : 'div';

        const onScroll = states['onScroll'] ? states['onScroll'].defaultValue : false;
        const onVisible = states['onVisible'] ? states['onVisible'].defaultValue : false;

        const scrollTop = states['scrollTop'] ? states['scrollTop'].defaultValue : 50; // to check if top scroll is greater than 50
        const scrollLeft = states['scrollLeft'] ? states['scrollLeft'].defaultValue : 50; // to check if left scroll is greater than 50
        const scrollTopClass = states['scrollTopClass'] ? states['scrollTopClass'].defaultValue : "";
        const scrollLeftClass = states['scrollLeftClass'] ? states['scrollLeftClass'].defaultValue : "";

        const oneTime = states['oneTime'] ? states['oneTime'].defaultValue : false;

        const visible = states['visible'] ? states['visible'].defaultValue : 10 / 100; // element visible percentage
        const visibleClass = states['visibleClass'] ? states['visibleClass'].defaultValue : "";
        const inVisibleClass = states['inVisibleClass'] ? states['inVisibleClass'].defaultValue : "";
        const [visibleCls, setVisibleClasses] = useState({ name: inVisibleClass })

        let observer;

        useEffect(() => {
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
                            setVisibleClasses({ name: inVisibleClass});
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
        }, [visibleClass, onVisible, visible, ref.current, oneTime]);

        useEffect(() => {

            if (onScroll) {

                const iframe = document.querySelector("#ac-editor-iframe-doc");



                if (iframe) {
                    const iframeWindow = iframe.contentWindow;

                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

                    const handleScroll = () => {
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


                    };

                    iframeWindow.addEventListener('scroll', handleScroll);

                }
            }

            return () => {
                if (onScroll) {

                    const iframe = document.querySelector("#ac-editor-iframe-doc");

                    if (iframe) {
                        const iframeWindow = iframe.contentWindow;

                        iframeWindow.removeEventListener('scroll', () => {
                            setLeftClasses({});
                            setTopClasses({});

                        });
                    }
                }
            };
        }, [onScroll, scrollLeft, scrollTop, scrollTopClass, scrollLeftClass]);

        const observableItem = useMemo(
            () => element(
                {
                    ...node,
                    tagName,
                    classes: [...(Array.isArray(node.classes) ? node.classes : []),
                    topClass?.name ? topClass : '',
                    leftClass?.name ? leftClass : '',
                    visibleCls?.name ? visibleCls : '',
                    ], state: undefined, map: undefined
                },
                children
            ),
            [children, topClass, tagName, leftClass, visibleCls]
        );

        return <span style={{ display: 'inline' }} ref={ref}
        
        
        >{observableItem}</span>;

    };

export default Observable;