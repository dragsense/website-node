import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dropdown from './dropdown';

// Function to get default value from states
const getDefaultValue = (states, key, defaultValue) => states[key] ? states[key].defaultValue : defaultValue;

// Function to update states
const updateState = (key, value, states, updateStates) => {
    if(value !== states[key].defaultValue) {
        updateStates(key, value);
    }
};

const DropdownItem = (props) => {
  const {
    children,
    states,
    element,
    updateStates,
    node,
  } = props;

// Using useMemo for performance optimization
  const openDropdown = useMemo(() => getDefaultValue(states, 'openDropdown', 0), [states]);
  const type = useMemo(() => getDefaultValue(states, 'type', 'fade'), [states]);
  const expandable = useMemo(() => getDefaultValue(states, 'expandable', false), [states]);

  const initialValue = useMemo(() => getDefaultValue(states, 'initialValue', '200px'), [states]);
  const expandValue = useMemo(() => getDefaultValue(states, 'expandValue', '400px'), [states]);

  const openSide = useMemo(() => getDefaultValue(states, 'openSide', 'topLeft'), [states]);
  const leftOffset = useMemo(() => getDefaultValue(states, 'leftOffset', '15px'), [states]);
  const topOffset = useMemo(() => getDefaultValue(states, 'topOffset', '50px'), [states]);
  const duration = useMemo(() => getDefaultValue(states, 'duration', 300), [states]);

// Close dropdown function
  const closeDropdown = () => {
    if(openDropdown === 1)
    updateState('openDropdown', 0, states, updateStates)
  };



  return <Dropdown
    openDropdown={openDropdown}
    type={type}
    duration={duration} 
    closeDropdown={closeDropdown}
    openSide={openSide}
    expandable={expandable}
    initialValue={initialValue} 
    expandValue={expandValue}
    leftOffset={leftOffset}
    topOffset={topOffset}
    >{element({ ...node, state: undefined, map: undefined }, children)}</Dropdown>
};

export default DropdownItem;