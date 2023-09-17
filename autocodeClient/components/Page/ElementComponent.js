
const React = require("react");

import { useState, useCallback, useEffect } from "react";
import ElementMapping from './ElementMapping';

import { updateStateValue, getStateRef } from '../../utils/element-value';


const ElementComponent = (props) => {

    const { node, _id, fun, children, onUpdateStates } = props;

    const [states, setStates] = useState(node.states);
    const [state, setState] = useState(null);


    const setValue = async (elem, value, withValue) => {
        const type = elem.type;
        const key = elem.key;


        switch (type) {
            case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
            case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
            case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                updateStateValue(elem, withValue, states, value);
                setStates({ ...states });
            default:
                return;
        }

    }



    useEffect(() => {


        if (!node)
            return;

        setStates({ ...node.states });
        const cascaderStates = generateCascader(node.states, node.name, node.cname);
        onUpdateStates(node.cname, cascaderStates, setStates)

    }, [node]);

    useEffect(() => {

        if (!state)
            return;
        const { elem, stateValue, withValue } = state;
        setValue(elem, stateValue, withValue);
    }, [state]);

    const onClick = useCallback(async (node, stateValue, withValue) => {

        if (node && node.onClick) {
            const elem = node.onClick;
            setState({ elem, stateValue, withValue })

            if (fun?.onClick)
                fun.onClick(node, stateValue, withValue)
        }

    }, [states]);

    const updateStates = useCallback(async (key, value, updateKey = 'defaultValue') => {

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

        } else
            stateRef[updateKey] = value;

        setStates({ ...states });
    }, [states]);



    const onChange = useCallback(async (values, node, all = false) => {

        let allvalues = [];
        if (fun?.onChange)
            allvalues = fun.onChange(values, node, all)


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
                    case 'Menu': case 'Flex': case 'Tabs': case 'Accordion': case 'Sider':
                    case 'Grid': case 'Container': case 'Slider': case 'Gallery': case 'Dropdown':
                    case 'Dropdown': case 'Observable': case 'Modal': case 'GoToTop':
                        if (maKey[0] === 'items') {
                            const stateValues = Object.values(states['items']?.states || {}).map((val) => val.value.split(":")[0]);

                            options = [...(new Set([...options, ...stateValues]))];

                        }
                    default:


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




    }, [states]);



    return <span style={{ border: '#ffaa4f5e solid 1px', display: 'inline-block', width: '-webkit-fill-available' }}><ElementMapping
        {...props} map={node.map}
        _cstates={states}
        updateStates={updateStates}
        fun={{
            onChange: onChange,
            onClick: onClick,
        }}
        onClick={onClick}>
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
    </span>



};


export default ElementComponent;