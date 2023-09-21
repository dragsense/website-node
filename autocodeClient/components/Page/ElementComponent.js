const React = require("react");

import  { useState, useCallback, useEffect } from "react";
import ElementMapping from './ElementMapping';

import { updateStateValue } from '../../utils/element-value';

// Splitting the logic into smaller functions for better readability and performance
// Function to handle state updates
const handleStateUpdates = (elem, withValue, states, value, setStates) => {
    updateStateValue(elem, withValue, states, value);
    setStates(prevStates => ({ ...prevStates }));
}

// Function to handle onClick events
const handleOnClick = (node, stateValue, withValue, fun, setState) => {
    if (node && node.onClick) {
        const elem = node.onClick;
        setState({ elem, stateValue, withValue });

        if (fun?.onClick)
            fun.onClick(node, stateValue, withValue);
    }
}

// Function to handle onChange events
const handleOnChange = (values, node, all, fun, states, setValue) => {
    let allvalues = [];
    if (fun?.onChange)
        allvalues = fun.onChange(values, node, all);

    if (all) {
        let options = [];

        if (node.options) {
            options = node.options.split(",");
            options = Object.values(options).map((val) => val.split(":")[0]);
            if (Array.isArray(allvalues))
                options = [...(new Set([...allvalues, ...options]))];
        }

        if (node.map) {
            const maKey = node.map.key;
            const mapType = node.map.type;

            switch (mapType) {
                case 'Menu':
                case 'Flex':
                case 'Tabs':
                case 'Accordion':
                case 'Sider':
                case 'Grid':
                case 'Container':
                case 'Slider':
                case 'Gallery':
                case 'Dropdown':
                case 'Observable':
                case 'Modal':
                case 'GoToTop':
                    if (maKey[0] === 'items') {
                        const stateValues = Object.values(states['items']?.states || {}).map((val) => val.value.split(":")[0]);
                        options = [...(new Set([...options, ...stateValues]))];
                    }
                default:
                    break;
            }
        }
        allvalues = options;
    }

    for (const elem of values) {
        let value = elem.value;
        const onChange = elem.elem;

        if (value === 'all')
            value = allvalues.join(",");

        setValue(onChange, value, '');
    }
}

const ElementComponent = (props) => {

    const { node, _id, fun, children } = props;

    const [states, setStates] = useState(node.states);
    const [state, setState] = useState(null);

    const setValue = useCallback((elem, value, withValue) => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'Menu':
            case 'Flex':
            case 'Tabs':
            case 'Accordion':
            case 'Sider':
            case 'Grid':
            case 'Container':
            case 'Slider':
            case 'Gallery':
            case 'Dropdown':
            case 'Observable':
            case 'Modal':
            case 'GoToTop':
                handleStateUpdates(elem, withValue, states, value, setStates);
                break;
            default:
                return;
        }
    }, [states]);

    useEffect(() => {
        if (!node)
            return;
        setStates({ ...node.states });
     
    }, []);

    useEffect(() => {
        if (!state)
            return;
        const { elem, stateValue, withValue } = state;
        setValue(elem, stateValue, withValue);
    }, [state, setValue]);

    const onClick = useCallback((node, stateValue, withValue) => {
        handleOnClick(node, stateValue, withValue, fun, setState);
    }, [fun]);

    const updateStates = useCallback((key, value, updateKey = 'defaultValue') => {
        const stateRef = states[key];

        if (!stateRef)
            return;

        if (key === 'items') {
            const oldValues = states['items']?.states || {};
            const resultObject = Array.from({ length: parseInt(value) }, (_, index) => ({
                value: `${index + 1}:${oldValues[index]?.value || states['items']?.text || "Item"} ${index + 1}`,
                idx: index,
            })).reduce((acc, currentValue) => {
                acc[currentValue.idx] = currentValue;
                return acc;
            }, {});

            states['items'].states = resultObject;

            states['total'] = { ...(states['total'] || {}), max: value, defaultValue: value };
            if (states['currentIndex']) {
                const loop = states['loop'] ? states['loop'].defaultValue : false;

                states['currentIndex']['max'] = loop ? value + 1 : value;
                states['currentIndex']['min'] = loop ? -1 : 0;
            }
        } else {
            stateRef[updateKey] = value;
        }

        setStates(prevStates => ({ ...prevStates }));
    }, [states]);

    const onChange = useCallback((values, node, all = false) => {
        handleOnChange(values, node, all, fun, states, setValue);
    }, [states, setValue]);

    return (
            <ElementMapping
                {...props}
                map={node.map}
                _cstates={states}
                updateStates={updateStates}
                fun={{
                    onChange: onChange,
                    onClick: onClick,
                }}
                onClick={onClick}
            >
                {React.Children.map(children, (child, i) => {
                    return child && React.cloneElement(child, {
                        key: child.props?._uid,
                        fun: {
                            onChange: onChange,
                            onClick: onClick,
                        },
                        _cstates: states,
                        updateStates: updateStates
                    })
                })}
            </ElementMapping>
    );
};

export default ElementComponent;