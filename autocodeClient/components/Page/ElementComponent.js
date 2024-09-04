const React = require('react')

import { useState, useCallback, useEffect } from 'react'
import ElementMapping from './ElementMapping'
import { debounce } from '../../utils/utils'
import { updateStateValue } from '../../utils/element-value'

// Splitting the logic into smaller functions for better readability and performance
// Function to handle state updates
const handleStateUpdates = (elem, withValue, states, value, setStates) => {
    updateStateValue(elem, withValue, states, value)
    setStates((prevStates) => ({ ...prevStates }))
}

// Function to handle onClick events
const handleOnClick = (changeEvent, stateValue, withValue, fun, setState) => {
    console.log(changeEvent)

    if (changeEvent) {
        setState({ elem: changeEvent, stateValue, withValue })

        if (fun?.onClick) fun.onClick(changeEvent, stateValue, withValue, fun.onClick)
    }
}

// Function to handle onChange events
const handleOnChange = (values, node, all, fun, states, setValue) => {
    let allvalues = []
    if (fun?.onChange) allvalues = fun.onChange(values, node, all)

    if (all) {
        let options = []

        if (node.options) {
            options = node.options.split(',')
            options = Object.values(options).map((val) => val.split(':')[0])
            if (Array.isArray(allvalues)) options = [...new Set([...allvalues, ...options])]
        }

        if (node.map) {
            const maKey = node.map.key
            const mapType = node.map.type

            if (maKey[0] === 'items') {
                const stateValues = Object.values(states['items']?.states || {}).map((val) => val.value.split(':')[0])
                options = [...new Set([...options, ...stateValues])]
            }
        }
        allvalues = options
    }

    // Use a debounce function to limit the frequency of the loop
    const debouncedSetValue = debounce((values, allvalues) => {
        for (const elem of values) {
            let value = elem.value
            const elemToChange = elem.elem
            if (value === 'all') value = allvalues.join(',')

            setValue(elemToChange, value, '')
        }
    }, 100) // 300ms delay

    debouncedSetValue(values, allvalues)
}

const ElementComponent = (props) => {
    const { node, _id, fun, children } = props

    const [states, setStates] = useState({ _uid: node?._uid, ...node.states })
    const [state, setState] = useState(null)

    const setValue = (elem, value, withValue) => {
        handleStateUpdates(elem, withValue, states, value, setStates)
    }

    useEffect(() => {
        if (!node) return
        setStates({ _uid: node._uid, ...node.states })
    }, [])

    useEffect(() => {
        if (!state) return
        const { elem, stateValue, withValue } = state
        setValue(elem, stateValue, withValue)
    }, [state])

    const onClick = useCallback(
        (changeEvent, stateValue, withValue, func = () => {}) => {
            if (func === onClick) handleOnClick(changeEvent, stateValue, withValue, fun, setState)
        },
        [fun]
    )

    const updateStates = useCallback(
        (key, value, updateKey = 'defaultValue') => {
            
            if (key === 'activeItem')
                states[key] = {
                    defaultValue: null,
                    key,
                    type: 'node',
                }

                if (key === 'currentIndex')
                    states[key] = {
                        defaultValue: -1,
                        key,
                        type: 'number',
                    }

            const stateRef = states[key]

            if (!stateRef) return

            if (key === 'items') {
                const oldValues = states['items']?.states || {}
                const resultObject = Array.from({ length: parseInt(value) }, (_, index) => ({
                    value: `${index + 1}:${oldValues[index]?.value || states['items']?.text || 'Item'} ${index + 1}`,
                    idx: index,
                })).reduce((acc, currentValue) => {
                    acc[currentValue.idx] = currentValue
                    return acc
                }, {})

                states['items'].states = resultObject

                states['total'] = { ...(states['total'] || {}), max: value, defaultValue: value }
                if (states['currentIndex']) {
                    const loop = states['loop'] ? states['loop'].defaultValue : false

                    states['currentIndex']['max'] = loop ? value + 1 : value
                    states['currentIndex']['min'] = loop ? -1 : 0
                }
            } else {
                stateRef[updateKey] = value
            }

            setStates((prevStates) => ({ ...prevStates }))
        },
        [states]
    )

    const onChange = useCallback(
        (values, node, all = false) => {
            handleOnChange(values, node, all, fun, states, setValue)
        },
        [states, setValue]
    )

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
                return (
                    child &&
                    React.cloneElement(child, {
                        key: child.props?._uid,
                        fun: {
                            onChange: onChange,
                            onClick: onClick,
                        },
                        _cstates: states,
                        updateStates: updateStates,
                    })
                )
            })}
        </ElementMapping>
    )
}

export default ElementComponent
