
import React, { useMemo } from 'react';

const Media = (props) => {
    const { tag, pos, _uid, value, conds,
        onMouseMove,
        onClick, children, disabled } = props;

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

        const disabledStyles = {
            opacity: 0.2,
            border: '1px dashed #ccc',
        };

    const InputsElement = <div data-id={_uid}
        data-pos={pos} draggable={false} style={{
            border: '10px solid transparent',
            outline: '1px dashed #bdbdbd',
            cursor: 'pointer',
            display: 'inline-block',
            ...(conds ? {} : disabledStyles),

        }} >
        {React.cloneElement(children, {
       
            customAttributes:
            {
                width: 320, height: 'auto', controls: true,
                poster: tag == 'video' ? poster.src : undefined,
                alt: poster.alt,
                onMouseMove: onMouseMove,

            }
        }, [...sources, `Your browser does not support the ${tag} element.`])}

    </div>



    const disabledElement = React.cloneElement(children, {
   
        customAttributes:
            {
                width: 320, height: 'auto', controls: true,
                poster: tag == 'video' ? poster.src : undefined,
                alt: poster.alt,
                onMouseMove: onMouseMove,

                onClick: onClick,
                style: conds ? {} : disabledStyles
            }
        }, [...sources, `Your browser does not support the ${tag} element.`])



    return disabled ? disabledElement : InputsElement;

};

export default Media;