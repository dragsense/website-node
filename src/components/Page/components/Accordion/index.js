// import React, { useState, useEffect, useMemo } from 'react';

// import { getStateValue } from '@/lib/utils/elementNode';




// const Accordion = ({ children, states, index }) => {

//   const [opacity, setOpacity] = useState(0);

//   const slideHeight = useMemo(() => {
//     return getStateValue(['slideHeight'], states);

// }, [states]);

//   const activeIndex = useMemo(() => {
//     setOpacity(0);
//     return getStateValue(['slideIndex'], states);

// }, [states]);

//   useEffect(() => {
//     setTimeout(() => {
//       setOpacity(1);
//     }, 200);
//   }, [states]);


//   const button = children[0];
//   const content = children[1];

//   if (!button || !content) {
//     return 'Please add two children: one button and one content';
//   }


//   return (
//     <>
//       {React.cloneElement(<div>{button}</div>, {
//       })}
//       {React.cloneElement(<div>{content}</div>, {
//         style: {
//           width: '100%',
//           height: activeIndex === index ? slideHeight || 'auto' : 0,
//           opacity: activeIndex === index ? opacity : 0,
//           transition: 'height 0.5s ease-in-out, opacity 0.5s ease-in-out',
//           overflow: 'hidden',

//         }
//       })}
//     </>
//   );
// };

// export default Accordion;


import React, { useState, useEffect, useMemo, useRef } from 'react';

// function flattenChildren(children) {
//   return React.Children.toArray(children).reduce((acc, child) => {
//     if (React.isValidElement(child) && child.props.children) {
//       return acc.concat(flattenChildren(child.props.children));
//     }
//     return acc.concat(child);
//   }, []);
// }


const AccordionItems = (props) => {
  const { children,
    states,
    nodes,
    element,
    node,
    updateStates } = props;

  const total = states['total'] ? states['total'].defaultValue : 0;
  const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;


  const flattenedChildren = useMemo(() => {
    const flattenedChildren = nodes.length > 0 ? nodes.map((mapValue, mapIndex) => element(
      node,
      children[0],
      mapValue,
      mapIndex,
    ))
      :
      React.Children.toArray(children);
    const length = flattenedChildren.length;
    if (length !== total)
      updateStates('items', length, 'states');

    return flattenedChildren;

  }, [children.length, nodes]);

  const renderAccordion = useMemo(() => {
    const accordions = [];

    const totalAccordion = flattenedChildren.length;

    for (let i = 0; i < totalAccordion; i++) {
      const isActive = activeIndex === i;
      accordions.push(flattenedChildren[i].props?.children ?
          React.Children.map(flattenedChildren[i].props.children, child =>
            React.cloneElement(
              child, { mapIndex: i, isActive })) :
          React.cloneElement(flattenedChildren[i], { mapIndex: i, isActive }));
    }


    return accordions;
  }, [flattenedChildren])

  const accordionItems = useMemo(
    () =>
      element(
        { ...node, state: undefined, map: undefined },
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {renderAccordion}
        </div>
      ),
    [renderAccordion]
  );

  return accordionItems;
};

export default AccordionItems;
