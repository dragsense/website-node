

const React = require("react");
import { useEffect } from 'react';
import ElementWrapper from './ElementWrapper';

import ErrorBoundary from './ErrorBoundary';


function TreeNode(props) {

  let { pages, _uid,  pageType, _id, AutocodeCustom } = props;
  const node = pages[_id].elements[_uid];


  if (!node)
    return null;

  const children = node.childNodes.map((key, i) => <MemoizedTreeNode
    {...props}
    _uid={key}
    key={key}
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
    prevProps.setting?.resize === nextProps.setting?.resize &&
    prevProps._cstates === nextProps._cstates;

  return states;
});


export default function Elements({ setting, type, pages, states, _uid, _id, AutocodeCustom }) {

  const [pageSetting, setPageSetting] = React.useState(pages[_id].pageSetting || {});

  useEffect(() => {

    if(!setting || typeof window === 'undefined')
    return;

    const updateSize = () => {
      setPageSetting({ ...pageSetting, resize: !pageSetting.resize });
    };

    window.addEventListener('resize', updateSize);

    return () => {
      if (window)
        contentWindow.removeEventListener('resize', updateSize);
    }


  }, [pageSetting]);

  return <MemoizedTreeNode
    setting={{ ...setting, ...pageSetting }}
    _states={states}
    pages={pages}
    pageType={type}
    _id={_id}
    _uid={_uid}
    AutocodeCustom={AutocodeCustom}
  />
}