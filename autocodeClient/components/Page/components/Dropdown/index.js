import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dropdown from './dropdown';

const DropdownItem = (props) => {
  const {
    children,
    states,
    element,
    updateStates,
    node,
  } = props;


  const openDropdown = states['openDropdown'] ? states['openDropdown'].defaultValue : 0;
  const type = states['type'] ? states['type'].defaultValue : 'fade';
  const expandable = states['expandable'] ? states['expandable'].defaultValue : false;

  const intialValue = states['intialValue'] ? states['intialValue'].defaultValue : '200px';
  const expandValue = states['expandValue'] ? states['expandValue'].defaultValue : '400px';

  const openSide = states['openSide'] ? states['openSide'].defaultValue : "topLeft";
  const leftOffset = states['leftOffset'] ? states['leftOffset'].defaultValue : '15px';
  const topOffset = states['topOffset'] ? states['topOffset'].defaultValue : '50px';
  const duration = states['duration'] ? states['duration'].defaultValue : 300;

  const closeDropdown = () => {
    if(openDropdown === 1)
    updateStates('openDropdown', 0)
  };


  return <Dropdown
    openDropdown={openDropdown}
    type={type}
    duration={duration} 
    closeDropdown={closeDropdown}
    openSide={openSide}
    expandable={expandable}
    intialValue={intialValue} 
  expandValue={expandValue}
    leftOffset={leftOffset}
    topOffset={topOffset}>{element({ ...node, state: undefined, map: undefined }, children)}</Dropdown>
};

export default DropdownItem;