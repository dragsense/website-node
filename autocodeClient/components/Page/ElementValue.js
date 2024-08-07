import React, { useMemo, useCallback } from "react";

import ElementType from "./ElementType";

import { getStateValue, getPageValue } from '../../utils/element-value';

// Main component for handling Element Value
const ElementValue = (props) => {

    // Destructuring props for easier access
    const { 
        state,
        nodeValue,
        mapValue,
        mapIndex,
        _states,
        colStates,
        _props,
        disabled,
        fun,
        _cstates,
        attributes,
        setting = {},
        classes,
        conds,
        node,
        children 
    } = props;

    

         // Handle 'WINDOW' type
         const handleWindowType = (key) => {

    
            if(typeof window === 'undefined')
            return; 

            if (key[1] === 'width') {
                return window.innerWidth;
            } else if (key[1] === 'height') {
                return window.innerHeight;
            }
        };
    

    // Function to handle global type
    const handleGlobalType = (key) => {
        if (key[0] === "WEBSITE") {
            const global = setting.global || [];
            if (key[1] === 'images') {
                const images = global[key[1]] || {};
                const image = images[key[2]] || {}
                return {
                    value: image?.src ? setting?.host +image.src : '/images/default/default-img.png',
                    label: image === undefined ? `[${key[2]}]` : image?.alt || "Global Image"
                }
            }
            return {
                value: global[key[1]],
                label: global[key[1]] || `[global ${key[1]}]`
            }
        }  else
        if (key[0] === "WINDOW") 
           return handleWindowType(key);
    }

    // Function to handle colStates type
    const handleColStatesType = (key, value, host) => {
        if (!colStates)
            return value;

        if (key[0] === 'PAGES')
            return mapIndex + 1;
        else
            if (key[0] === 'docsLength' && colStates.documents)
                return colStates.documents.length || '0';
            else
                return getPageValue(key, colStates, host, mapIndex);
    }

    // Main function to get value based on type
    const getValue = (elem, value = '') => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'GLOBAL':
                return handleGlobalType(key);
            case 'PROPS':
                return getStateValue(key, _props, setting?.host) || `[props.${key}]`;
            case 'STATES':
                return getStateValue(key, _states, setting?.host);
            case 'PAGE':
                return getPageValue(key, setting, setting?.host, mapIndex);
            case 'COLSTATES':
                return handleColStatesType(key, value, setting?.host);
            case 'FORMSTATES':
                return _states && _states[key[0]] ? _states[key[0]][key[1]] || '[form state]' : value;
            case 'MAPVALUE':
                return mapValue;
            case 'MAPINDEX':
                return mapIndex;
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                return getStateValue(key, _cstates, setting?.host);
            default:
                return value;
        }
    }

   ;


    // Function to get value based on state
    const getValueBasedOnState = useCallback(() => {
    
        if (!state) return nodeValue;
        const value = getValue(state, nodeValue);
        return value || nodeValue;

    }, [state, nodeValue, _states, _props, colStates, _cstates, setting?.resize]);

    // useMemo hook to optimize performance by memoizing the value
    // It will only recompute the memoized value when one of the dependencies has changed
    // This optimization helps to avoid expensive calculations on every render
    const value = useMemo(getValueBasedOnState, [getValueBasedOnState]);

    // Extract values from onClick event
    const extractOnClickValues = (onclick) => {
        const withType = onclick.withtype;
        const withkey = onclick.withkey;
        let withValue = getValue({ type: withType, key: withkey });
        withValue = withValue?.value ? withValue.value : withValue

        const stateType = onclick.statetype;
        const stateKey = onclick.statekey;
        let stateValue = getValue({ type: stateType, key: stateKey }, '');
        stateValue = stateValue?.value ? stateValue.value : stateValue;

        return { withValue, stateValue };
    }

// Handle onClick event
const handleOnClick = (changeFun, fun, withValue, stateValue) => {
    if (withValue?.notClickable)
        return;

    if (fun?.onClick)
        fun.onClick(changeFun, stateValue, withValue);
}

const onClickNode = (e) => {
    // Prevent default action for anchor tags
    if (node.tagName === 'a')
        e.preventDefault();

    try {
        if (node.onClick) {
            let { withValue, stateValue } = extractOnClickValues(node.onClick);


            handleOnClick(node.onClick, fun, withValue, stateValue, value);
        }
    } catch (e) {
        console.error(e);
    }
}

const onMouseEnter = (e) => {
    // Prevent default action for anchor tags
    if (node.tagName === 'a')
        e.preventDefault();

    try {
        if (node.onMouseEnter) {
            let { withValue, stateValue } = extractOnClickValues(node.onMouseEnter);


            handleOnClick(node.onMouseEnter, fun, withValue, stateValue, value);
        }
    } catch (e) {
        console.error(e);
    }
}

const onMouseExit = (e) => {
    // Prevent default action for anchor tags
    if (node.tagName === 'a')
        e.preventDefault();

    try {
        if (node.onMouseEnter) {
            let { withValue, stateValue } = extractOnClickValues(node.onMouseExit);


            handleOnClick(node.onMouseExit, fun, withValue, stateValue, value);
        }
    } catch (e) {
        console.error(e);
    }
}


// Function to handle onChange event
const handleOnChange = (onChangeEvent, value, node, all) => {


    // Check if onChange function exists in fun object
    if (fun?.onChange) {
        // Call the onChange function with the required parameters

        fun.onChange([{ elem: onChangeEvent, value }], node, all);
    }
}

// Function to validate onChange event
const validateOnChange = (onChangeEvent) => {
    // Check if onChangeEvent has a value or if it doesn't exist
    return onChangeEvent?.value;
}

const onChangeNode = (value, all) => {



    // Extract onChange event from node
    const onChangeEvent = node.onChange;


    try {
        // Validate onChange event
        if (validateOnChange(onChangeEvent)) {
            // Handle onChange event
            handleOnChange(onChangeEvent, value, node, all);
        }
    } catch (e) {
        // Log any errors
        console.error(e);
    }
}

// Function to handle mouse move event
const handleMouseMove = (e, onMouseMove) => {
    let pageX, pageY, scrollLeft, scrollTop;

    // Determine mouse type and set pageX and pageY accordingly
    if (onMouseMove.mouseType === 'page') {
        pageX = e.pageX;
        pageY = e.pageY;
    } else {
        pageX = e.clientX;
        pageY = e.clientY;
    }

    // Determine scroll type and set scrollLeft and scrollTop accordingly
    if (onMouseMove.scrollType === 'pageScroll') {
        if (iframe) {
            scrollLeft = window.scrollX;
            scrollTop = window.scrollY;
        }
    } else {
        scrollLeft = e.target.scrollLeft;
        scrollTop = e.target.scrollTop;
    }

    return { pageX, pageY, scrollLeft, scrollTop, delta: onMouseMove.delta };
}

// Function to calculate valueX and valueY based on mouse move
const calculateMouseMoveValues = (onMouseMove, pageX, pageY, scrollLeft, scrollTop, delta) => {
    let valueX = '', valueY = '';

    // Calculate valueX if it exists
    if (onMouseMove.valueX) {
        valueX = onMouseMove.valueX.replace(/\[X]/g, pageX);
        valueX = valueX.replace(/\[Y]/g, pageY);
        valueX = valueX.replace(/\[left]/g, scrollLeft);
        valueX = valueX.replace(/\[top]/g, scrollTop);
        valueX = valueX.replace(/\[delta]/g, delta);
    }

    // Calculate valueY if it exists
    if (onMouseMove.valueY) {
        valueY = onMouseMove.valueY.replace(/\[Y]/g, pageY);
        valueY = valueY.replace(/\[X]/g, pageX);
        valueY = valueY.replace(/\[left]/g, scrollLeft);
        valueY = valueY.replace(/\[top]/g, scrollTop);
        valueY = valueY.replace(/\[delta]/g, delta);
    }

    return { valueX, valueY };
}

const onMouseMove = (e) => {
    e.preventDefault();

    const onMouseMove = node.onMouseMove;


    if (!onMouseMove)
        return;

    try {
        const { pageX, pageY, scrollLeft, scrollTop, delta } = handleMouseMove(e, onMouseMove);
        let { valueX, valueY } = calculateMouseMoveValues(onMouseMove, pageX, pageY, scrollLeft, scrollTop, delta);

        if (valueX || valueY) {
            try {
                valueX = eval(valueX);
                valueY = eval(valueY);
            } catch (e) {
                console.error("Invalid expression:", e);
            }


            if (fun?.onChange)
                fun.onChange([{ elem: onMouseMove.stateValueX || null, value: valueX }, { elem: onMouseMove.stateValueY || null, value: valueY }], node, null);
        }
    }
    catch (e) {
        console.error(e);
    }
}

// Function to handle scroll event
const handleScroll = (e, onScroll) => {
    const scrollLeft = e.target.scrollLeft;
    const scrollTop = e.target.scrollTop;
    const delta = onScroll.delta;



    return { scrollLeft, scrollTop, delta };
}

// Function to calculate valueX and valueY based on scroll
const calculateScrollValues = (onScroll, scrollLeft, scrollTop, delta) => {
    let valueX = '', valueY = '';

    // Calculate valueX if it exists
    if (onScroll?.valueX) {
        valueX = onScroll.valueX.replace(/\[left]/g, scrollLeft);
        valueX = valueX.replace(/\[top]/g, scrollTop);
        valueX = valueX.replace(/\[delta]/g, delta);
    }

    // Calculate valueY if it exists
    if (onScroll?.valueY) {
        valueY = onScroll.valueY.replace(/\[top]/g, scrollTop);
        valueY = valueY.replace(/\[left]/g, scrollLeft);
        valueY = valueY.replace(/\[delta]/g, delta);
    }

    return { valueX, valueY };
}

const onScroll = (e) => {


    e.preventDefault();

    const onScroll = node.onScroll;

   

    if (!onScroll || !fun?.onChange)
        return;

    try {
        const { scrollLeft, scrollTop, delta } = handleScroll(e, onScroll);
        let { valueX, valueY } = calculateScrollValues(onScroll, scrollLeft, scrollTop, delta);

        if (valueX || valueY) {
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
        message.error(e?.message);
    }
}

// Check if the event handlers are defined in the node
const hasOnChange = useMemo(() => Boolean(node.onChange), [node.onChange]);
const hasOnMouseMove = useMemo(() => Boolean(node.onMouseMove), [node.onMouseMove]);
const hasOnEnter = useMemo(() => Boolean(node.onMouseEnter), [node.onMouseEnter]);
const hasOnLeave = useMemo(() => Boolean(node.onMouseExit), [node.onMouseExit]);
const hasOnClick = useMemo(() => Boolean(node.onClick), [node.onClick]);
const hasOnScroll = useMemo(() => Boolean(node.onScroll), [node.onScroll]);


return (
    <ElementType
        {...props}
        value={value}
        attributes={attributes}
        classes={classes}
        node={node}
        conds={conds}
        mapValue={mapValue}
        mapIndex={mapIndex}
        // Assign event handlers only if they are defined in the node
        onChange={hasOnChange ? onChangeNode : undefined}
        onMouseMove={hasOnMouseMove ? onMouseMove : undefined}
        onClick={hasOnClick ? onClickNode : undefined}
        onMouseEnter={hasOnEnter ? onMouseEnter : undefined}
        onMouseExit={hasOnLeave ? onMouseExit : undefined}

        onScroll={hasOnScroll ? onScroll : undefined}
        // Disable the button if no input change
        disabled={disabled}
    >
        {children}
    </ElementType>
);


};

export default ElementValue;