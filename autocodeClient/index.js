import React, { useMemo } from "react";
import { hydrateRoot } from 'react-dom/client';
import { PageComponent } from './components';
import PageServices from './libs/services/page';
import AppClient from 'AppClient';

// Function to create the PageComponent with memoization for performance
const createPageComponent = ({ pages, _id, top, bottom, setting, states, type, AutocodeCustom }) => {
    return useMemo(() => (
        <PageComponent 
            pages={pages}
            top={top}
            bottom={bottom} 
            _id={_id} 
            setting={setting}
            AutocodeCustom={AutocodeCustom}
            states={states} 
            type={type} 
        />
    ), [pages, _id, top, bottom, setting, states, type, AutocodeCustom]);
};

// Main App component
function App(props) {
    const memoizedPageComponent = createPageComponent(props);
    return <>{memoizedPageComponent}</>;
};

export default App;

// Function to load initial data and hydrate the root
const loadData = async (initialData) => {
    const { _id, type, setting } = initialData;

    try {
        const res = await PageServices.get(_id, type, origin);

        // Hydrate the root with the App component
        hydrateRoot(
            document.getElementById('root'),
            <App pages={res.pages} _id={_id} 
                top={res.layout?.top}
                bottom={res.layout?.bottom} 
                setting={setting} 
                states={res.states}
                type={type}
                AutocodeCustom={AppClient} 
            />
        );

    } catch (e) {
        // Handle error
        console.error(e);
    } finally {
        // Clean up data script
        const dataScript = document.getElementById(`ac-data-script-${_id}`);
        if (dataScript) 
            dataScript.remove();
    }
}

// Load initial data if window is defined
if (typeof window !== 'undefined') {
    const initialData = window.__INITIAL_DATA__ || {};
    loadData(initialData);
}
