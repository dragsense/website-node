import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sider from './Sider';

// Function to get the default value of a state
const getDefaultValue = (state, defaultValue) => state ? state.defaultValue : defaultValue;

const Slides = (props) => {
  const {
    children,
    states,
    element,
    node,
  } = props;

// Using useMemo to optimize performance by memoizing the state values
  const openSider = useMemo(() => getDefaultValue(states['openSider'], -1), [states]);
  const type = useMemo(() => getDefaultValue(states['type'], 'expandRight'), [states]);
  const initialValue = useMemo(() => getDefaultValue(states['initialValue'], '200px'), [states]);
  const expandValue = useMemo(() => getDefaultValue(states['expandValue'], '400px'), [states]);
  const duration = useMemo(() => getDefaultValue(states['duration'], 300), [states]);

// Disable the Sider if no input change
  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    setIsDisabled(!states);
  }, [states]);

  return (
    <Sider 
      openSider={openSider} 
      type={type} 
      duration={duration}
      initialValue={initialValue} 
      expandValue={expandValue}
      disabled={isDisabled}
    >
      {element({ ...node, state: undefined, map: undefined }, children)}
    </Sider>
  );
};

export default Slides;