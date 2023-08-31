
const React = require("react");

import { useState, useCallback, useEffect } from "react";
import ElementMapping from './ElementMapping';

import { updateStateValue, getStateRef } from '../../utils/element-value';

const ElementComponent = (props) => {

    const { node, children } = props;s

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

        if (!state)
            return;
        const { elem, stateValue, withValue } = state;
        setValue(elem, stateValue, withValue);
    }, [state]);

    const onClick = useCallback(async (node, stateValue, withValue) => {

        if (node && node.onClick) {
            const elem = node.onClick;



            setState({ elem, stateValue, withValue })
        }

    }, [states]);

    const updateStates = useCallback(async (key, value, updateKey = 'defaultValue') => {

        const stateRef = states[key];

        if (!stateRef)
            return;

        if (key === 'items') {


            const oldValues = Array.isArray(states['items'].states) ? states['items'].states : []
            const values = Array.from({ length: parseInt(value) }, (_, index) => {
                return oldValues[index] || `${states['items'].text || "Item"} ${index + 1}`
            });
            states['items'] = {
                ...(states['items'] || {}),
                states: values
            };


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




    const onChange = useCallback(async (node, value, all = false) => {


        if (node && node.state) {


            if (all && node.map) {

                if (value.includes('all')) {
                    const maKey = node.map.key;
                    const mapType = node.map.type;
                    let map = null;
                    if (mapType == 'STATES')
                        map = getStateRef(maKey, states);
                    else
                        map = getStateRef(maKey, states);

                    if (map) {
                        const states = Object.values(map.states).map((val) => val.split(":")[0]);
                        let options = node.options.split(",");
                        options = Object.values(options).map((val) => val.split(":")[0]);
                        value = [...(new Set([...options, ...states]))].join(',');

                    }
                } else
                    value = ''
            }

            setValue(node.state, value, '');

        }

    }, [states]);



    return <span style={{border: '#ffaa4f5e solid 1px', display:'inline-block', width: '-webkit-fill-available'  }}><ElementMapping
        {...props} map={node.map}
        _cstates={states}
        updateStates={updateStates}
        onChange={onChange}
        onClick={onClick}>
        {React.Children.map(children, (child) => {
            return child && React.cloneElement(child, {
                onChange: onChange,
                onClick: onClick,
                _cstates: states,
                updateStates: updateStates
            })
        })}
    </ElementMapping>
</span>



};


export default ElementComponent;