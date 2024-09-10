import React, { useMemo } from "react";
import { PageComponent } from './components';

import PageServices from './libs/services/page';

// Function to create the PageComponent with memoization for performance
const createPageComponent = ({ pages, _id, setting, states, type, AutocodeCustom }) => {
    return useMemo(() => (
        <PageComponent 
            pages={pages}
            _id={_id} 
            setting={setting}
            AutocodeCustom={AutocodeCustom}
            states={states} 
            type={type} 
        />
    ), [pages, _id, setting, states, type, AutocodeCustom]);
};

// Main App component
function App(props) {
    const memoizedPageComponent = createPageComponent(props);
    return <>{memoizedPageComponent}</>;
};

export default App;

// Function to load initial data and hydrate the root
const loadData = async (initialData, AppClient) => {
    const { _id, type, setting, remainingSlug } = initialData;

    try {
        const res = await PageServices.get(_id, type, remainingSlug, origin);

        // Hydrate the root with the App component
        ReactDOM.hydrateRoot(
            document.getElementById('root'),
            <App pages={res.pages} _id={_id} 
                setting={setting} 
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
    const CustomComponents = typeof DragSenseAppClient !== 'undefined' ? DragSenseAppClient : window.DragSenseAppClient;
    loadData(initialData, CustomComponents); 
}


export { createPageComponent };
