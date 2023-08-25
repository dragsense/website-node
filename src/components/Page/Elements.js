

import React from 'react';
import ElementWrapper from './ElementWrapper';

import ErrorBoundary from './ErrorBoundary';


function TreeNode(props) {

  let { pages, _uid, _states, _props, colStates, pageType, _id, AutocodeCustom } = props;
  const node = pages[_id].elements[_uid];



 if(!node)
 return null;

  const children =  node.childNodes.map((key, i) => <MemoizedTreeNode
    {...props}
    _uid={key}
    _id={_id}
    key={key}
    colStates={colStates}
    _states={_states}
    _props={_props}
    pageType={""}
  />)
 
  const component = node.page?.pageType === 'component' ? node.page : null;
  const rootComponent = pageType === 'component' ? { _id } : null;

  const form = node.page?.pageType === 'form' ? node.page : null;
  const rootForm = pageType === 'form' ? { _id } : null;



  return (<ErrorBoundary><ElementWrapper key={_uid}
    {...props}
    component={rootComponent || component}
    customPath={node.customPath}
    form={rootForm || form}
    _id={_id}
    colStates={colStates}
    _states={_states}
    _props={_props}
    node={node}
    AutocodeCustom={AutocodeCustom}
  >
    {children}
  </ElementWrapper></ErrorBoundary>);
}

const MemoizedTreeNode = React.memo(TreeNode, (prevProps, nextProps) => {
  const states = prevProps._states === nextProps._states &&
    prevProps._props === nextProps._props &&
    prevProps.formStates === nextProps.formStates &&
    prevProps.colStates === nextProps.colStates &&
    prevProps._cstates === nextProps._cstates;

  return states;
});


export default function Elements({ setting, type, pages, states, _uid, _id, AutocodeCustom }) {

  return <MemoizedTreeNode
    setting={setting}
    _states={states}
    pages={pages}
    pageType={type}
    _id={_id}
    _uid={_uid}
    AutocodeCustom={AutocodeCustom}
  />
}