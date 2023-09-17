
const React = require("react");
import { Select, Input, InputGroup, Image, Media, CloseTag, General, Option, Icon, Component } from "./Type";
import Element from "./Element";




const ElementType = (props) => {

    const {
        attributes,
        classes,
        value,
        conds,
        mapValue,
        mapIndex,
        onChange,
        onClick,
        onScroll,
        onMouseMove,
        disabled,
        options,
        node,
        children,
        pos } = props;

    const _uid = node._uid;
    let tagType = node.tagName;
  

    const layout = node.layout;
    if (layout == 'inputgroup')
        tagType = "inputgroup";
    if (layout == 'icon' || layout == 'svg-icon')
        tagType = "icon";

    if (node.type === 'layouts' || layout === 'button')
        tagType = 'layouts'

    if (node.type === 'component')
        tagType = 'component';

        if (node.tagName == 'hr')
        tagType = "close";

    const element = <Element  key={_uid}  classes={classes} attributes={attributes} tagName={node.tagName} />

    switch (tagType) {

        case 'select':
            return <Select
                disabled={disabled}
                onChange={onChange}
                innerWraaper={children}
                value={value.value || value}
                _uid={_uid}
                pos={pos}
                options={options}
                conds={conds}
                onClick={onClick}

            >{element}</Select>
        case 'option':

            return <Option


                value={value.value || value}
                mapIndex={mapIndex}

                mapValue={mapValue}
            >{element}</Option>
        case 'input':
        case 'textarea':
            return <Input disabled={disabled}
                conds={conds}
                onClick={onClick}

                onChange={onChange} _uid={_uid} pos={pos} value={value.value ?? value}>{element}</Input>
        case 'inputgroup':

            return <InputGroup
                disabled={disabled}

                type={attributes["type"]}
                onChange={onChange}
                value={value}
                mapValue={mapValue}
                labelPos={node.labelPos || 0}
                _uid={_uid}
                pos={pos}
                conds={conds}
                onClick={onClick}
                onMouseMove={onMouseMove}

                attributes={attributes}
                options={options}
            ><Element classes={classes} tagName={'label'} /></InputGroup>
        case 'img':
            return <Image disabled={disabled}
                conds={conds}
                onClick={onClick}
                onMouseMove={onMouseMove}

                _uid={_uid} name={node.name || node.tagName} pos={pos} value={value}>{element}</Image>
        case 'video':
        case 'audio':
            return <Media disabled={disabled}
                conds={conds}

                tag={node.tagName}
                _uid={_uid}
                pos={pos}
                onClick={onClick}
                onMouseMove={onMouseMove}

                value={value}>{element}</Media>
        case 'close':
            return <CloseTag disabled={disabled}
                conds={conds}
                onClick={onClick}
                onMouseMove={onMouseMove}

                name={node.name || node.tagName} _uid={_uid} pos={pos}>{element}</CloseTag>
        case 'icon':
            return <Icon disabled={disabled}

                onChange={onChange}
                value={value}
                _uid={_uid}
                pos={pos}
                onClick={onClick}
                onMouseMove={onMouseMove}

                conds={conds}
                layout={layout}
                classes={node.classes}
            >{element}</Icon>
        case 'component':
        case 'layouts':
            return <Component
                disabled={disabled}
                value={value.label || value || node.name}
                pos={pos}
                _uid={_uid}
                name={node.cname || node.name || node.tagName}
                conds={conds}
                onClick={onClick}
                onScroll={onScroll}
                onMouseMove={onMouseMove}
                innerWraaper={children}>
                {element}
            </Component>
        default:
            return <General
                disabled={disabled}
                
                pos={pos}
                _uid={_uid}
                name={node.cname || node.name || node.tagName}
                conds={conds} 
                onMouseMove={onMouseMove}
                onScroll={onScroll}
                onClick={onClick}
                value={value?.label || value} innerWraaper={children}>
                {element}
            </General>

    }

};

export default ElementType;