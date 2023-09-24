import React, { useMemo } from "react";
import { Select, Input, InputGroup, Image, Media, CloseTag, General, Option, Icon, Component } from "./Type";
import Element from "./Element";

// Function to determine the tag type
const getTagType = (node, layout) => {
    let tagType = node.tagName;
    if (layout === 'inputgroup') tagType = "inputgroup";
    if (layout === 'icon' || layout === 'svg-icon') tagType = "icon";
    if (node.type === 'layouts' || layout === 'button') tagType = 'layouts';
    if (node.type === 'component') tagType = 'component';
    if (node.tagName === 'hr') tagType = "close";
    return tagType;
}

// Function to handle the rendering of different types of elements
const renderElement = (tagType, layout, props) => {
    const { 
        disabled, 
        onChange, 
        children, 
        value, 
        _uid, 
        pos, 
        options, 
        conds, 
        onClick, 
        onMouseMove, 
        attributes, 
        onMouseEnter,
        onMouseExit,
        mapValue, 
        mapIndex, 
        node, 
        onScroll,
        setting,
        classes } = props;

      

    const element = <Element key={_uid} classes={classes} attributes={attributes} tagName={node.tagName} />;

    switch (tagType) {
        case 'select':
            return <Select disabled={disabled} onChange={onChange} innerWraaper={children} value={value.value || value} _uid={_uid} pos={pos} options={options} conds={conds} onClick={onClick}>{element}</Select>;
        case 'option':
            return <Option value={value.value || value} 
            
            mapIndex={mapIndex} mapValue={mapValue}>{element}</Option>;
        case 'input':
        case 'textarea':
            return <Input disabled={disabled} 
            conds={conds} 
            onClick={onClick}
             type={attributes["type"]} onChange={onChange} _uid={_uid} pos={pos} value={value.value ?? value}>{element}</Input>;
        case 'inputgroup':
            return <InputGroup disabled={disabled} type={attributes["type"]} onChange={onChange} value={value} mapValue={mapValue} labelPos={node.labelPos || 0} _uid={_uid} pos={pos} conds={conds} onClick={onClick} onMouseMove={onMouseMove} attributes={attributes} options={options}><Element classes={classes} tagName={'label'} /></InputGroup>;
        case 'img':
            return <Image disabled={disabled} 
            onMouseEnter={onMouseEnter}
                onMouseExit={onMouseExit}
            
            host={setting?.host || ''} conds={conds} onClick={onClick} onMouseMove={onMouseMove} _uid={_uid} name={node.name || node.tagName} pos={pos} value={value}>{element}</Image>;
        case 'video':
        case 'audio':
            return <Media disabled={disabled} host={setting?.host || ''} conds={conds} tag={node.tagName} _uid={_uid} pos={pos} onClick={onClick} onMouseMove={onMouseMove} value={value}>{element}</Media>;
        case 'close':
            return <CloseTag disabled={disabled} conds={conds} onClick={onClick} onMouseMove={onMouseMove} name={node.name || node.tagName} _uid={_uid} pos={pos}>{element}</CloseTag>;
        case 'icon':
            return <Icon disabled={disabled} 
            onMouseEnter={onMouseEnter}
                onMouseExit={onMouseExit}
            onChange={onChange} value={value} _uid={_uid} pos={pos} onClick={onClick} onMouseMove={onMouseMove} conds={conds} layout={layout} classes={node.classes}>{element}</Icon>;
        case 'component':
        case 'layouts':
            return <Component disabled={disabled} value={value.label || value}
            
             pos={pos} _uid={_uid} name={node.cname || node.name || node.tagName}
              conds={conds} 
              onMouseEnter={onMouseEnter}
                onMouseExit={onMouseExit}
              onClick={onClick} onScroll={onScroll} onMouseMove={onMouseMove} innerWraaper={children}>{element}</Component>;
        default:
            return <General disabled={disabled} pos={pos} _uid={_uid} 
            name={node.cname || node.name || node.tagName} 
            conds={conds} 
            onMouseEnter={onMouseEnter}
                onMouseExit={onMouseExit}
            onMouseMove={onMouseMove} onScroll={onScroll} onClick={onClick} value={value?.label || value} innerWraaper={children}>{element}</General>;
    }
}

const ElementType = (props) => {
    const {  node } = props;
    const layout = node.layout;
    const tagType = useMemo(() => getTagType(node, layout), [node, layout]); // useMemo for performance optimization
    return renderElement(tagType, layout, props);
}

export default ElementType;