const React = require("react");

import Elements from './Elements';


export default function Page({ _id,
    type,
    pages,
    setting,
    AutocodeCustom }) {


    return <>
        {pages[_id] && <Elements
            _uid={'0'}
            _id={_id}
            pages={pages}
            type={type}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />}
     
    </>


}