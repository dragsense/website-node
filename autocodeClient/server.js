const React = require("react");
import { PageComponent } from './components';

function App({ pages, _id, top, bottom, setting, type, AutocodeCustom }) {
    const memoizedPageComponent = <PageComponent 
    pages={pages}
    top={top}
    bottom={bottom} 
    _id={_id} 
    setting={setting}
    AutocodeCustom={AutocodeCustom}
    type={type} />;
    return <>{memoizedPageComponent}</>;
};

export default App;


