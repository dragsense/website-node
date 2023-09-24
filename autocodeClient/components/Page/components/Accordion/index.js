const React = require("react");

import  { useState, useEffect, useMemo, useRef } from 'react';

// Function to flatten children
const flattenChildren = (nodes, element, node, children, total, updateStates) => {
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
}

// Function to render accordion
const renderAccordion = (flattenedChildren, activeIndex) => {
  const accordions = [];

  const totalAccordion = flattenedChildren.length;

  for (let i = 0; i < totalAccordion; i++) {
    const isActive = activeIndex === i;
    accordions.push(flattenedChildren[i].props?.children ?
        React.Children.map(flattenedChildren[i].props.children, child =>
          React.cloneElement(
            child, { mapIndex: i, isActive, key: child.props?._uid })) :
        React.cloneElement(flattenedChildren[i], { mapIndex: i, isActive, key: flattenedChildren[i].props?._uid  }));
  }

  return accordions;
}

const AccordionItems = (props) => {
  const { children,
    states,
    nodes,
    element,
    node,
    updateStates } = props;

  const total = states['total'] ? states['total'].defaultValue : 0;
  const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;

  // Use useMemo for performance optimization
  const flattenedChildren = useMemo(() => flattenChildren(nodes, element, node, children, total, updateStates), [children.length, nodes]);

  const accordions = useMemo(() => renderAccordion(flattenedChildren, activeIndex), [flattenedChildren, activeIndex])

  const accordionItems = useMemo(
    () =>
      element(
        { ...node, state: undefined, map: undefined },
        <div  _uid={node._uid} style={{ position: 'relative', overflow: 'hidden' }}>
          {accordions}
        </div>
      ),
    [accordions]
  );

  return accordionItems;
};

export default AccordionItems;
