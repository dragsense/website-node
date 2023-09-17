
import React from "react";


const ComplexLogics = ({ children, getStateValue, getPropValue, updateProp, updateState }) => {


    return (
        <div>
            <h1>HEllo {getStateValue(['name'])}</h1>
            {children}
            <button onClick={() => {
                updateState(['name'], 'Adam')
            }}>
            Set name
            </button>

        </div>
    );

};


export default ComplexLogics;