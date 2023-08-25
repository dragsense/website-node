import React from "react";

import Elements from './Elements';


export default function Page({ _id,
    top,
    bottom,
    type,
    pages,
    setting,
    states, AutocodeCustom }) {


    return <>
         {pages[top] && <Elements
            _uid={'0'}
            _id={top}
            pages={pages}
            states={pages[top].states || {}}
            type={"component"}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />} 

        {pages[_id] && <Elements
            _uid={'0'}
            _id={_id}
            pages={pages}
            states={states}
            type={type}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />}
        {pages[bottom] && <Elements
            _uid={'0'}
            _id={bottom}
            pages={pages}
            states={pages[bottom].states || {}}
            type={"component"}
            setting={setting}
            AutocodeCustom={AutocodeCustom}
        />} 
    </>


}