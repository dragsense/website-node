const React = require("react");
import { PageComponent } from './components';

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


