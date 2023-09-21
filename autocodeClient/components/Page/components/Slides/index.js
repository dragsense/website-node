import React, { useState, useEffect, useMemo, useRef } from 'react';
import Slide from './Slide';

// Function to get the default value of a state
const getDefaultValue = (state, defaultValue) => state ? state.defaultValue : defaultValue;

// Function to handle slide transition
const handleSlideTransition = (flattenedChildren, numColumns, activeIndex, updateStates) => {
  const totalSlides = Math.ceil(flattenedChildren.length / numColumns);
  let newIndex = activeIndex + 1; // Increment the active index by 1

  if (newIndex >= totalSlides * numColumns) {
    newIndex = 0; // Reset to the first slide if reached the end
  }

  updateStates('currentIndex', newIndex);
  updateStates('activeItem', flattenedChildren[newIndex]);
};

// Function to set loop index
const setLoopIndex = (flattenedChildren, type, numColumns, moveColumns, activeIndex, updateStates) => {
  const isSlide = type === 'slide';
  const cols = isSlide ? numColumns : 1;
  let moves = isSlide ? moveColumns : 1;

  if (moves > cols)
    moves = cols;

  let totalSlides = Math.ceil(flattenedChildren.length / moves);
  let newIndex = activeIndex;

  if (newIndex >= totalSlides) {
    newIndex = 0;
  } else if (newIndex < 0) {
    newIndex = totalSlides - 1;
  }

  updateStates('currentIndex', newIndex);
  updateStates('activeItem', flattenedChildren[newIndex]);
};

// Main Slides component
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

// Using getDefaultValue function to get the default values of states
  const total = getDefaultValue(states['total'], 0);
  const activeIndex = getDefaultValue(states['currentIndex'], -1);
  const numColumns = getDefaultValue(states['numColumns'], 1);
  const moveColumns = getDefaultValue(states['moveColumns'], 1);
  const space = getDefaultValue(states['space'], 0.1);
  const centered = getDefaultValue(states['centered'], false);
  const type = getDefaultValue(states['type'], 'slide');
  const autoPlay = getDefaultValue(states['autoPlay'], false);
  const duration = getDefaultValue(states['duration'], 300);
  const loop = getDefaultValue(states['loop'], false);
  const hoverStop = getDefaultValue(states['hoverStop'], 1);
  const interval = getDefaultValue(states['interval'], 3000);

// Using useMemo for performance optimization
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

// Using useEffect to handle slide transition and loop index
  useEffect(() => {
    let timer;

    if (autoPlay && !isHovered) {
      if (!loop && activeIndex === total - 1) {
        clearInterval(timer);
      } else {
        timer = setInterval(() => {
          handleSlideTransition(flattenedChildren, numColumns, activeIndex, updateStates);
        }, interval);
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, [autoPlay, interval, loop, activeIndex, total, isHovered]);

  useEffect(() => {

    if (loop)
      setLoopIndex(flattenedChildren, type, numColumns, moveColumns, activeIndex, updateStates);
    else
      updateStates('activeItem', flattenedChildren[activeIndex]);

  }, [activeIndex]);

// Event handlers for mouse enter and leave
  const handleMouseEnter = () => {
    setIsHovered(hoverStop);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

// Render slides
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

// Render the main slides component
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