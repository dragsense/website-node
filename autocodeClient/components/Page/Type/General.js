
const React = require("react");

const General = ({  _uid, onClick, innerWraaper, value, children }) => {


    const spanElement = !innerWraaper ? [] : (
        <>
          {React.isValidElement(value) ? value : (value && (
            <span 
              key={_uid} 
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ))}
          {innerWraaper}
        </>
      );

    const clonedElement = React.cloneElement(children, {
        customAttributes: {
            key:_uid,
            onClick: onClick
        }
    }, spanElement);


    return clonedElement;


};

export default General;