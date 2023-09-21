import React, { useState, useRef, useMemo } from 'react';
import { Transition } from 'react-transition-group';

// Last active index is used to determine the direction of slide transition
let lastActiveIndex = 0;

// Slide component for handling individual slide transitions
const Slide = ({
  children,
  activeIndex,
  lastIndex,
  slideWidth,
  total,
  moveOffset,
  duration,
  updateStates,
  type,
  leftMargin,
  centered,
  index,
  isSlide,
}) => {
  const nodeRef = useRef(null);

  // Get the transition style based on the type of transition and duration
  const sliderTransition = transitions[type].getTransition(duration, activeIndex);

  // Check if the current slide is active
  const isActive = useMemo(() => activeIndex === index, [activeIndex, index]);

  // Calculate the translateX value for the slide
  const translateX = useMemo(() => `-${slideWidth * moveOffset * activeIndex}%`, [slideWidth, moveOffset, activeIndex]);

  // Skip condition for slide transition
  const skip = useMemo(() => ((lastActiveIndex <= 0) && activeIndex >= total - 1) || (lastActiveIndex === total && activeIndex >= 0), [lastActiveIndex, activeIndex, total]);

  // Update the last active index
  lastActiveIndex = activeIndex;

  // State for handling mouse drag
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [mtranslateX, setTranslateX] = useState(0);

  // Scale for mouse movement
  const movementScale = 0.8;

  // Handle mouse down event
  const handleMouseDown = (event) => {
    setDragging(true);
    setStartX(event.clientX - nodeRef.current.getBoundingClientRect().left);
  };

  // Calculate total width of the slide
  const totalWidth = useMemo(() => 100 * (isSlide ? lastIndex + 1 : 1), [isSlide, lastIndex]);

  // Handle mouse move event
  const handleMouseMove = (event) => {
    if (dragging) {
      const currentX = event.clientX - nodeRef.current.getBoundingClientRect().left;
      const moveX = currentX - startX;

      // Maximum allowed translateX
      const maxTranslateX = totalWidth;

      // Ensure translateX stays within bounds
      setTranslateX(Math.min(maxTranslateX, Math.max(-maxTranslateX, moveX * movementScale)));
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    setDragging(false);
    const moveDistance = Math.abs(mtranslateX);
    const newIndex = Math.round(moveDistance / totalWidth);

    // Calculate new active index based on the direction of mouse movement
    const newActiveIndex = activeIndex + (mtranslateX > 0 ? -newIndex : newIndex);
    const index = Math.max(0, Math.min(total - 1, newActiveIndex));
    updateStates('currentIndex', index);

    // Reset translateX
    setTranslateX(0);
  };

  // Handle mouse leave event
  const handleMouseLeave = () => {
    if (dragging) {
      handleMouseUp();
    }
  };

  // Render the slide with transition
  return (
    <Transition nodeRef={nodeRef} in={isActive || isSlide} timeout={duration}>
      {(state) => {
        const baseStyle = {
          position: 'absolute', 
          top: 0,
          left: centered ? -(leftMargin) + "%" : 0,
          width: `${totalWidth}%`,
          justifyContent: centered ? 'center' : 'flex-start',
          height: '100%',
          display: 'flex',
          ...(skip && isSlide ? {} : sliderTransition.defaultStyles),
        };

        // Calculate transition styles based on the state of the slide
        const transitionStyles = isSlide
          ? {
              transform: `translateX(${dragging ? mtranslateX + '%' : translateX})`,
            }
          : sliderTransition[state];

        // Render the slide
        return (
          <div
            ref={nodeRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ ...baseStyle, ...transitionStyles }}
          >
            {children}
          </div>
        );
      }}
    </Transition>
  );
};

// Transition styles for slide and fade transitions
const transitions = {
  slide: {
    getTransition: (duration = 300, index) => {
      const defaultStyles = {
        transition: `transform ${duration}ms ease-in-out`,
      };

      const entering = {
        transform: 'translateX(0%)',
      };

      const entered = {
        transform: 'translateX(0%)',
      };

      const exiting = {
        transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
      };

      const exited = {
        transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
      };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
  fade: {
    getTransition: (duration = 300) => {
      const defaultStyles = {
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0,
      };

      const entering = { opacity: 1 };
      const entered = { opacity: 1 };
      const exiting = { opacity: 0 };
      const exited = { opacity: 0 };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
};

export default Slide;
