const React = require("react");

import  { useMemo } from 'react';

import {
    Slides, Tabs, TabsButton, TabsContent, Accordion, AccordionItems, Modal, Gallery,
    Sider,
    Dropdown, Gototop, Menu, Observable
} from './components';

import ElementSetting from './ElementSetting';

// Destructuring props for better readability and performance
const ElementLayout = (props) => {

    const { _states, _cstates, updateStates, nodes, layout, pos,
        mapNodes, options, mapIndex, mapValue, isActive, node, children } = props;

    // Function to handle element setting
    const handleElementSetting = (node, children, mapValue, mapIndex) => {
        return <ElementSetting
            {...props}
            node={node}
            _states={_states}
            _cstates={_cstates}
            mapNodes={mapNodes}
            attributes={node.attributes}
            conditions={node.conditions}
            classes={node.classes}
            mapValue={mapValue}
           {...(mapValue?.type === 'docs' ? { colStates: { ...props.colStates, ...mapValue } } : {})}
            mapIndex={mapIndex}
            options={options}
            key={mapValue?.key || mapIndex || node._uid}
        >{React.Children.map(children, (child, index) => {

            return React.cloneElement(child, {
                key:  child.props?.key || child.props?._uid || index,
                ...(mapValue ? { mapValue } : {}),
                ...(mapIndex ? { mapIndex } : {}),
                ...(mapValue?.type === 'docs' ? { colStates: { ...props.colStates, ...mapValue } } : {}),

            })
        })
            }
        </ElementSetting>
    }

    // useMemo for performance optimization
    const elements = useMemo(() => {
        return nodes.length > 0 ?
            nodes.map((mapValue, mapIndex) => handleElementSetting(node, children, mapValue, mapIndex)) :
            handleElementSetting(node, children, mapValue, mapIndex);

    }, [nodes])

    // Switch case for different layout types
    switch (layout) {
        case 'slides':
            return <Slides
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Slides>

        case 'tabs':
            return <Tabs
                node={node}
                nodes={nodes}
                element={handleElementSetting}
            >{children}</Tabs>

        case 'tabs-btn':
            return <TabsButton
                states={_cstates}
                node={node}
                nodes={mapNodes}
                element={handleElementSetting}
                updateStates={updateStates}
            >{children}</TabsButton>

        case 'tabs-content':
            return <TabsContent
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}
            >{children}</TabsContent>

        case 'accordions':

            return <AccordionItems
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</AccordionItems>

        case 'accordion':
            const duration = _cstates['duration'] ? _cstates['duration'].defaultValue : 300;

            return handleElementSetting(node, <Accordion
                isActive={isActive}
                duration={duration}
            >{children}</Accordion>)

        case 'modal':
            return <Modal
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Modal>

        case 'gallery':
            return <Gallery
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Gallery>
        case 'sider':
            return <Sider
                states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Sider>

        case 'dropdown':
            return <Dropdown
                states={_cstates}
                node={node}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Dropdown>;

        case 'gototop':
            return <Gototop
                states={_cstates}
                node={node}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Gototop>;
        case 'observable':
            return <Observable
                states={_cstates}
                node={node}
                element={handleElementSetting}
                updateStates={updateStates}>{elements}
            </Observable>;
        case 'menu':
            return <Menu states={_cstates}
                node={node}
                nodes={nodes}
                element={handleElementSetting}
                updateStates={updateStates}>{children}</Menu>;

        case 'select':
        case 'multiselect':

            return handleElementSetting(node, nodes.length > 0 ?
                nodes.map((mapValue, mapIndex) =>
                    <ElementSetting
                        key={mapValue.key || mapIndex}
                        _states={_states}
                        node={{ _uid: mapIndex + 1, tagName: 'option' }}
                        attributes={node.childAttributes}
                        classes={{}}
                        conditions={node.childConditions}
                        mapValue={mapValue}
                        mapIndex={mapIndex}
                    />) :
                [])




        default:
            return elements;
    }

};

export default ElementLayout;