import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sider from './Sider';

const Slides = (props) => {
  const {
    children,
    states,
    element,
    node,
  } = props;


  const openSider = states['openSider'] ? states['openSider'].defaultValue : -1;
  const type = states['type'] ? states['type'].defaultValue : 'expandRight';
  const intialValue = states['intialValue'] ? states['intialValue'].defaultValue : '200px';
  const expandValue = states['expandValue'] ? states['expandValue'].defaultValue : '400px';
  const duration = states['duration'] ? states['duration'].defaultValue : 300;


  return <Sider 
  openSider={openSider} 
  type={type} 
  duration={duration}
  intialValue={intialValue} 
  expandValue={expandValue}>{element({ ...node, state: undefined, map: undefined }, children)}</Sider>
};

export default Slides;