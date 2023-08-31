const React = require("react");

import { hydrateRoot } from 'react-dom/client';
import { PageComponent } from './components';
import PageServices from './libs/services/page';
import AppClient from 'AppClient';

function App({ pages, _id, top, bottom, setting, states, type, AutocodeCustom }) {
    const memoizedPageComponent = <PageComponent 
    pages={pages}
    top={top}
    bottom={bottom} 
    _id={_id} 
    setting={setting}
    AutocodeCustom={AutocodeCustom}
     states={states} 
    type={type} />;
    return <>{memoizedPageComponent}</>;
};

export default App;

const laodData = async (initialData) => {
    const { _id, type, setting } = initialData;

    try {

        const res = await PageServices.get(_id, type, origin);

        hydrateRoot(
            document.getElementById('root'),
            <App pages={res.pages} _id={_id} 
            top={res.layout?.top}
             bottom={res.layout?.bottom} 
             setting={setting} 
             states={res.states}
              type={type}
               AutocodeCustom={AppClient} />
        );

    } catch (e) {

        console.log(e?.message)

    } finally {

        const dataScript = document.getElementById(`ac-data-script-${_id}`);
        if (dataScript) 
            dataScript.remove();
    }
}

if (typeof window !== 'undefined') {
    const initialData = window.__INITIAL_DATA__ || {};

    laodData(initialData);
}

