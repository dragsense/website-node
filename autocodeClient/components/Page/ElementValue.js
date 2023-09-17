
const React = require("react");

import { useMemo } from "react";

import ElementType from "./ElementType";

import { getStateValue, getPageValue } from '../../utils/element-value';


const ElementValue = (props) => {


    const { state,
        nodeValue,
        mapValue,
        mapIndex,
        _states,
        colStates,
        _props,
        fun,
        _cstates,
        attributes,
        setting = {},
        classes,
        conds,
        node,
        children } = props;



    const getValue = (elem, value = '') => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'GLOBAL':

                if (key[0] === "WEBSITE") {
                    const global = setting.global || [];
                    if (key[1] === 'images') {
                        const images = global[key[1]] || {};
                        const image = images[key[2]] || {}
                        return {
                            value: image?.src ? image.src : '/images/default/default-img.png',
                            label: image === undefined ? `[${key[2]}]` : image?.alt || "Global Image"
                        }

                    }

                    return {
                        value: global[key[1]],
                        label: global[key[1]] || `[global ${key[1]}]`
                    }
                }

            case 'PROPS':
                return getStateValue(key, _props) || `[props.${key}]`;
            case 'STATES':
                return getStateValue(key, _states);
            case 'PAGE':
                console.log(setting['name'])
                return getPageValue(key, setting);
            case 'COLSTATES':

                if (!colStates)
                    return value;

                if (key[0] === 'PAGES')
                    return mapIndex + 1;
                else
                    if (key[0] === 'docsLength' && colStates.documents)
                        return colStates.documents.length || '0';
                    else
                        return getPageValue(key, colStates);


            case 'FORMSTATES':
                if (_states && _states[key[0]])
                    return _states[key[0]][key[1]] || '[form state]'

            case 'MAPVALUE':
                return mapValue;
            case 'MAPINDEX':
                return mapIndex;
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                return getStateValue(key, _cstates);

            default:
                return value;

        }

    }


    const value = useMemo(() => {

        if (!state)
            return nodeValue;
        const value = getValue(state, nodeValue);
        return value || nodeValue;

    }, [state, colStates, _cstates, _states, _props, mapValue, nodeValue]);

    const onClickNode = (e) => {

        if (node.tagName === 'a')
            e.preventDefault();
        try {
            if (node.onClick) {
                const onclick = node.onClick;

                const withType = onclick.withtype;
                const withkey = onclick.withkey;
                let withValue = getValue({ type: withType, key: withkey });
                withValue = withValue?.value ? withValue.value : withValue

                const stateType = onclick.statetype;
                const stateKey = onclick.statekey;
                let stateValue = getValue({ type: stateType, key: stateKey }, '');
                stateValue = stateValue?.value ? stateValue.value : stateValue;

                if (withValue?.notClickable)
                    return;


                if (fun?.onClick)
                    fun.onClick(node, stateValue, withValue);
            }
        } catch (e) {

        }
    }

    const onChangeNode = (value, all) => {

        const onChangeEvent = node.onChange;
        try {
            if (onChangeEvent?.value || !onChangeEvent) {

                if (fun?.onChange)
                    fun.onChange([{ elem: onChangeEvent, value }], node, all);
            }
        } catch (e) {
        }

    }

    const onMouseMove = (e) => {
        e.preventDefault();

        const onMouseMove = node.onMouseMove;


        if (!onMouseMove)
            return;
        try {
            let pageX;
            let pageY;

            let scrollLeft;
            let scrollTop;

            if (onMouseMove.mouseType === 'page') {
                pageX = e.pageX;
                pageY = e.pageY;
            } else {
                pageX = e.clientX;
                pageY = e.clientY;
            }


            if (onMouseMove.scrollType === 'pageScroll') {
                const iframe = document.querySelector("#ac-editor-iframe-doc");

                if (iframe) {
                    const iframeWindow = iframe.contentWindow;
                    scrollLeft = iframeWindow.pageYOffset;
                    scrollTop = iframeWindow.pageYOffset;
                }
            } else {

                scrollLeft = e.target.scrollLeft;
                scrollTop = e.target.scrollTop;
            }


            const delta = onMouseMove.delta;

            if (onMouseMove.valueX || onMouseMove.valueY) {

                let valueX = '';
                if (onMouseMove.valueX) {
                    valueX = onMouseMove.valueX.replace(/\[X]/g, pageX);
                    valueX = valueX.replace(/\[Y]/g, pageY);
                    valueX = valueX.replace(/\[left]/g, scrollLeft);
                    valueX = valueX.replace(/\[top]/g, scrollTop);
                    valueX = valueX.replace(/\[delta]/g, delta);
                }

                let valueY = ''
                if (onMouseMove.valueY) {
                    valueY = onMouseMove.valueY.replace(/\[Y]/g, pageY);
                    valueY = valueY.replace(/\[X]/g, pageX);
                    valueY = valueY.replace(/\[left]/g, scrollLeft);
                    valueY = valueY.replace(/\[top]/g, scrollTop);
                    valueY = valueY.replace(/\[delta]/g, delta);
                }
                try {
                    valueX = eval(valueX);
                    valueY = eval(valueY);

                } catch (e) {
                    console.error("Invalid expression:", e);

                }

                if (fun?.onChange)
                    fun.onChange([{ elem: onMouseMove.stateValueX || {}, value: valueX }, { elem: onMouseMove.stateValueY || {}, value: valueY }], node, null);
            }
        }
        catch (e) {
        }
    }


    const onScroll = (e) => {


        e.preventDefault();

        const onScroll = node.onScroll;

        if (!onScroll || !fun?.onChange)
            return;

        try {
            const scrollLeft = e.target.scrollLeft;
            const scrollTop = e.target.scrollTop;


            const delta = onScroll.delta;


            if (onScroll?.valueX || onScroll?.valueY) {

                let valueX = '';
                if (onScroll?.valueX) {
                    valueX = onScroll.valueX.replace(/\[left]/g, scrollLeft);
                    valueX = valueX.replace(/\[top]/g, scrollTop);
                    valueX = valueX.replace(/\[delta]/g, delta);
                }

                let valueY = ''
                if (onScroll?.valueY) {
                    valueY = onScroll.valueY.replace(/\[top]/g, scrollTop);
                    valueY = valueY.replace(/\[left]/g, scrollLeft);
                    valueY = valueY.replace(/\[delta]/g, delta);
                }

                try {
                    valueX = eval(valueX);
                    valueY = eval(valueY);

                } catch (e) {
                    message.error("Invalid expression:" + e?.message);

                }

                if (fun?.onChange)
                    fun.onChange([
                        { elem: onScroll.stateValueX || {}, value: valueX },
                        { elem: onScroll.stateValueY || {}, value: valueY }],
                        node, null);
            }
        }
        catch (e) {
        }
    }

    return <ElementType
        {...props}
        value={value}
        attributes={attributes}
        classes={classes}
        node={node}
        conds={conds}
        mapValue={mapValue}
        mapIndex={mapIndex}
        onChange={node.onChange ? onChangeNode : undefined}
        onMouseMove={node.onMouseMove ? onMouseMove : undefined}
        onClick={node.onClick ? onClickNode : undefined}
        onScroll={node.onScroll ? onScroll : undefined}
    >{children}</ElementType>



};

export default ElementValue;