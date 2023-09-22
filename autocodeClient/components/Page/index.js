const React = require("react");

import Elements from './Elements';


export default function Page({ _id,
    top,
    bottom,
    type,
    pages,
    setting,
    AutocodeCustom }) {


    return <>
         {top && pages[top] && <Elements
            _uid={'0'}
            _id={top}
            pages={pages}
            type={"component"}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />} 
        
        {pages[_id] && <Elements
            _uid={'0'}
            _id={_id}
            pages={pages}
            type={type}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />}
        {bottom && pages[bottom] && <Elements
            _uid={'0'}
            _id={bottom}
            pages={pages}
            type={"component"}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />} 
    </>


}