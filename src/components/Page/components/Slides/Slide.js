import React, { useState, useRef } from 'react';
import { Transition } from 'react-transition-group';

let lastActiveIndex = 0;

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
  const sliderTransition = transitions[type].getTransition(duration, activeIndex);
  const isActive = activeIndex === index;

  let translateX = `-${slideWidth * moveOffset * activeIndex}%`;


  const skip = ((lastActiveIndex <= 0) && activeIndex >= total - 1) || (lastActiveIndex === total && activeIndex >= 0);

  lastActiveIndex = activeIndex;

  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [mtranslateX, setTranslateX] = useState(0);
  const movementScale = 0.8;
  const handleMouseDown = (event) => {
    setDragging(true);
    setStartX(event.clientX - nodeRef.current.getBoundingClientRect().left);
  };

  const totalWidth = 100 * (isSlide ? lastIndex + 1 : 1);

  const handleMouseMove = (event) => {
    if (dragging) {
      const currentX = event.clientX - nodeRef.current.getBoundingClientRect().left;
      const moveX = currentX - startX;

      const maxTranslateX = totalWidth; // Maximum allowed translateX

      // Ensure translateX stays within bounds
      setTranslateX(Math.min(maxTranslateX, Math.max(-maxTranslateX, moveX * movementScale)));
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    const moveDistance = Math.abs(mtranslateX);
    const newIndex = Math.round(moveDistance / totalWidth);

    const newActiveIndex = activeIndex + (mtranslateX > 0 ? -newIndex : newIndex);
    const index = Math.max(0, Math.min(total - 1, newActiveIndex));
    updateStates('currentIndex', index);

    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (dragging) {
      handleMouseUp();
    }
  };

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

        const transitionStyles = isSlide
          ? {
              transform: `translateX(${dragging ? mtranslateX + '%' : translateX})`,
            }
          : sliderTransition[state];

        return (
          <div
            ref={nodeRef}
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseUp={handleMouseUp}
            // onMouseLeave={handleMouseLeave}
            style={{ ...baseStyle, ...transitionStyles }}
          >
            {children}
          </div>
        );
      }}
    </Transition>
  );
};

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



// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { Transition } from 'react-transition-group';

// const Slide = ({ children, activeIndex, lastIndex, moveOffset, duration, type, index }) => {
//   const nodeRef = useRef(null);

//   const sliderTransition = transitions[type].getTransition(duration, index);
//   const isActive = activeIndex === index;

//   let lastActiveIndex = activeIndex;

//   useEffect(() => {
//     lastActiveIndex = activeIndex;
//   }, [activeIndex]);

//   const slideCount = lastIndex + 1;
//   const prevIndex = (index - 1 + slideCount) % slideCount;
//   const nextIndex = (index + 1) % slideCount;

//   const isPrevSlide = activeIndex === prevIndex;
//   const isNextSlide = activeIndex === nextIndex;

//   const isSingleSlide = slideCount === 1;

//   return (
//     <Transition nodeRef={nodeRef} in={isActive || type === 'slide'} timeout={duration}>
//       {state => {
//         const baseStyle = {
//           position: 'absolute',
//           top: 0,
//           left: type === 'slide'
//             ? isActive || isSingleSlide
//               ? '0%'
//               : isPrevSlide
//                 ? '100%'
//                 : isNextSlide
//                   ? '-100%'
//                   : '0%'
//             : 0,
//           width: '100%',
//           height: '100%',
          
//           ...sliderTransition.defaultStyles,
//         };

//         const transitionStyles = type === 'slide'
//           ? {
//             transform: isActive || isSingleSlide
//               ? 'translateX(0%)'
//               : isPrevSlide
//                 ? 'translateX(100%)'
//                 : isNextSlide
//                   ? 'translateX(-100%)'
//                   : '0%'
//           }
//           : sliderTransition[state];



//         return (
//           <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>

//             {children}
//           </div>
//         );
//       }}
//     </Transition>
//   );
// };

// const transitions = {
//   slide: {
//     getTransition: (duration = 300, index) => {
//       const defaultStyles = {
//         transition: `transform ${duration}ms ease-in-out`,
//       };

//       const entering = {
//         transform: 'translateX(0%)',
//       };

//       const entered = {
//         transform: 'translateX(0%)',
//       };

//       const exiting = {
//         transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
//       };

//       const exited = {
//         transform: index === 0 ? 'translateX(100%)' : 'translateX(-100%)',
//       };

//       return { defaultStyles, entering, entered, exiting, exited };
//     },
//   },
//   fade: {
//     getTransition: (duration = 300) => {
//       const defaultStyles = {
//         transition: `opacity ${duration}ms ease-in-out`,
//         opacity: 0,
//       };

//       const entering = { opacity: 1 };
//       const entered = { opacity: 1 };
//       const exiting = { opacity: 0 };
//       const exited = { opacity: 0 };

//       return { defaultStyles, entering, entered, exiting, exited };
//     },
//   },
// };


// export default Slide;