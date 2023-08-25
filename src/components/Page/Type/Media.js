
import React from 'react';

const Media = (props) => {
    const { tag,  value, children } = props;

    const poster =
        value.value ?
            { src: value.value, alt: value.label || tag } :
            { src: value, alt: tag };

    const srcs = Array.isArray(value.srcs) ? value.srcs : [];


    let sources = srcs.map((media, index) => {
        return <source key={index} src={media.src} type={media.mimetype} />
    });

  

    if (srcs.length <= 0 && tag == 'audio')
        sources = [<source key={'default'} src={poster.src} type="audio/mp3" />]

    const InputsElement = React.cloneElement(children, {
        customAttributes:
        {
            width: 320, height: 'auto', controls: true,
            poster: tag == 'video' ? poster.src : undefined,
            alt: poster.alt,
        }
    }, [...sources, `Your browser does not support the ${tag} element.`])



    return InputsElement;

};

export default Media;