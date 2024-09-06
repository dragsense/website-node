import React, { useState } from 'react'

export default function ComplexLogics({ children, getStateValue, getPropValue, updateProp, updateState }) {
    // Local state
    const [localState, setLocalState] = useState(getStateValue(['my-state']) || '')
    const [localProp, setLocalProp] = useState(getPropValue(['my-state']) || '')

    // Handling state updates
    const handleStateChange = (newValue) => {
        setLocalState(newValue)
        updateState(['my-state'], newValue) // Update the state in the parent component
    }

    // Handling prop updates
    const handlePropChange = (newValue) => {
        setLocalProp(newValue)
        updateProp(['my-state'], newValue) // Update a specific prop in the parent component
    }

    return (
        <div>
            <h1>Complex Logics Component</h1>
            <p>Current State: {localState}</p>
            <p>Current Prop Value: {localProp}</p>
            <button onClick={() => handleStateChange('New State Value (Changed from Complex Logic Component)')}>
                Update State
            </button>
            <button onClick={() => handlePropChange('New Prop Value (Changed from Complex Logic Component)')}>
                Update Prop
            </button>
            <div>
                AutoCode children <br />
                {children}
            </div>
        </div>
    )
}
