import React, { useState, useEffect, useMemo, useRef } from 'react';
import Slide from './Slide';

const Slides = (props) => {
  const {
    children,
    states,
    nodes,
    element,
    node,
    updateStates
  } = props;

  const nodeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const total = states['total'] ? states['total'].defaultValue : 0;
  const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : -1;
  const numColumns = states['numColumns'] ? states['numColumns'].defaultValue : 1;
  const moveColumns = states['moveColumns'] ? states['moveColumns'].defaultValue : 1;
  const space = states['space'] ? states['space'].defaultValue : 0.1;
  const centered = states['centered'] ? states['centered'].defaultValue : false;

  const type = states['type'] ? states['type'].defaultValue : 'slide';

  const autoPlay = states['autoPlay'] ? states['autoPlay'].defaultValue : false;
  const duration = states['duration'] ? states['duration'].defaultValue : 300;
  const loop = states['loop'] ? states['loop'].defaultValue : false;
  const hoverStop = states['hoverStop'] ? states['hoverStop'].defaultValue : 1;

  const interval = states['interval'] ? states['interval'].defaultValue : 3000;

  const flattenedChildren = useMemo(() => {
    const flattenedChildren =
      nodes.length > 0
        ? nodes.map((mapValue, mapIndex) =>
          element({ tagName: 'div', layout: 'empty', state: node.state }, children, mapValue, mapIndex)
        )
        : React.Children.toArray(children);

    const length = flattenedChildren.length;
    if (length !== total) {
      const isSlide = type === 'slide';
      const cols = isSlide ? numColumns : 1;
      let moves = isSlide ? moveColumns : 1;

      if (moves > cols)
        moves = cols;

      const totalSlides = Math.ceil(flattenedChildren.length / moves);
  

      updateStates('items', totalSlides, 'states');
    }

    return flattenedChildren;
  }, [children.length, nodes,]);

  useEffect(() => {
    let timer;

    const handleSlideTransition = () => {
      const totalSlides = Math.ceil(flattenedChildren.length / numColumns);
      let newIndex = activeIndex + 1; // Increment the active index by 1

      if (newIndex >= totalSlides * numColumns) {
        newIndex = 0; // Reset to the first slide if reached the end
      }

      updateStates('currentIndex', newIndex);
      updateStates('activeItem', flattenedChildren[newIndex]);
    };

    if (autoPlay && !isHovered) {
      if (!loop && activeIndex === total - 1) {
        clearInterval(timer);
      } else {
        timer = setInterval(() => {
          handleSlideTransition();
        }, interval);
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, [autoPlay, interval, loop, activeIndex, total, isHovered]);

  const setLoopIndex = () => {

    const isSlide = type === 'slide';
    const cols = isSlide ? numColumns : 1;
    let moves = isSlide ? moveColumns : 1;

    if (moves > cols)
      moves = cols;

    let totalSlides = Math.ceil(flattenedChildren.length / moves);
    // totalSlides += 2;
    let newIndex = activeIndex;

    if (newIndex >= totalSlides) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = totalSlides - 1;
    }

    updateStates('currentIndex', newIndex);
    updateStates('activeItem', flattenedChildren[newIndex]);
  };

  useEffect(() => {

    if (loop)
      setLoopIndex()
    else
      updateStates('activeItem', flattenedChildren[activeIndex]);

  }, [activeIndex]);

  const handleMouseEnter = () => {
    setIsHovered(hoverStop);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const renderSlides = useMemo(() => {

    let slides = [];


    let sortAsc = false;
    let sortDesc = false;
    const slideChildren = [];

    const isSlide = type === 'slide';
    const cols = isSlide ? numColumns : 1;



    let moves = isSlide ? moveColumns : 1;

    if (moves > cols)
      moves = cols;




    const total = Math.ceil(flattenedChildren.length / moves);
    let childs = [];

    if (loop) {
      const appendChilds = flattenedChildren.slice(0, (cols - moves) + 1);
      const clonedArray = [...flattenedChildren];
      childs = [...clonedArray, ...appendChilds];
    } else
      childs = flattenedChildren;

    const totalSlides = Math.ceil(childs.length / cols);

    const margin = space;
    const width = (100 / totalSlides) / cols;

    for (let i = 0; i < childs.length; i++) {

      // sortAsc = activeIndex === total - 1 && i === 0;
      // sortDesc = activeIndex === 0 && i === total - 1;
      if (!isSlide) {
        slides.push(<Slide
          key={0}
          moveOffset={moves}
          index={i}
          activeIndex={activeIndex}
          lastIndex={totalSlides - 1}
          duration={duration}
          type={type}
          isSlide={false}
        ><div
          key={i}
          style={{
            display: 'block',
            width: '100%'
          }}
        >{childs[i]}</div></Slide>)
      } else {

        const startIndex = i * numColumns;
        const endIndex = startIndex + numColumns;
        const slideItems = childs.slice(startIndex, endIndex);


        slides.push(slideItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              display: 'block',
              width: (width - (margin * 2)) + '%',
              margin: `0 ${margin}%`,
              
            }}
          >
            {item}
          </div>
        )));
      }
    }

 
    return isSlide ? <Slide
      key={0}
      updateStates={updateStates}
      moveOffset={moves}
      index={0}
      activeIndex={activeIndex}
      slideWidth={width}
      total={total}
      leftMargin={((cols - 1) * 100) / cols}
      centered={centered}
      lastIndex={totalSlides - 1}
      duration={duration}
      type={type}
      isSlide={isSlide}
    >{slides}</Slide> : slides


  }, [flattenedChildren, numColumns, moveColumns, activeIndex]);

  const slides = useMemo(
    () =>
      element(
        { ...node, state: undefined, map: undefined },
        <div
          ref={nodeRef}
          style={{ position: 'relative', height: '100%', overflow: 'hidden' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {renderSlides}
        </div>
      ),
    [renderSlides]
  );

  return slides;
};

export default Slides;