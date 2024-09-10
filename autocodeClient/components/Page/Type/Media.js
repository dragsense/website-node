const React = require("react");

import { useMemo, useCallback } from 'react';

// Custom function to generate random id
const generateRandomId = () => Math.random().toString(36).substring(2, 6);

// Function to create poster object
const createPoster = (value, tag, host) => {
    return value.value ? { src: host + value.value, alt: value.label || tag } : { src: value, alt: tag };
}

// Function to create sources array
const createSources = (srcs, poster, tag, host) => {
    let sources = srcs.map((media, index) => {
        return <source key={index} src={host+media.src} type={media.mimetype} />
    });

    if (srcs.length <= 0 && tag === 'audio') {
        sources = [<source key={'default'} src={poster.src} type="audio/mp3" />]
    }

    return sources;
}


const Media = (props) => {
    const { tag, host, value, conds, onMouseMove, children } = props;

    // useMemo to avoid unnecessary re-renders and improve performance
    const poster = useMemo(() => createPoster(value, tag, host), [value, tag]);

    const srcs = Array.isArray(value.srcs) ? value.srcs : [];

    // useMemo to avoid unnecessary re-renders and improve performance
    const sources = useMemo(() => createSources(srcs, poster, tag, host), [srcs, poster, tag]);

    // useMemo to avoid unnecessary re-renders and improve performance
    const key = useMemo(() => generateRandomId(), [value.srcs]);

    const InputsElement = React.cloneElement(children, {
                key,
                customAttributes: {
                    controls: true,
                    poster: tag === 'video' ? poster.src : undefined,
                    alt: poster.alt,
                    onMouseMove: onMouseMove,
                }
            }, [...sources, `Your browser does not support the ${tag} element.`])
    



    return conds ?  InputsElement : null;
};

export default Media;