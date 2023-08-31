
const React = require("react");


const General = ({  _uid, onClick, innerWraaper, children }) => {


    const spanElement = !innerWraaper ? [] : innerWraaper;
  
    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            key:_uid,
            onClick: onClick
        }
    }, spanElement);


    return clonedElement;


};

export default General;