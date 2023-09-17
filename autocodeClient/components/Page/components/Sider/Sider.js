import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

const Slider = ({ children, openSider, duration, type, intialValue, expandValue }) => {
  const nodeRef = useRef(null);

  const sliderTransition = transitions[type].getTransition(duration, intialValue, expandValue);

  return (
    <Transition nodeRef={nodeRef} in={openSider} timeout={duration}>
      {state => {
        const baseStyle = {
          width: '100%',
          ...sliderTransition.defaultStyles,
        };
        const transitionStyles =  sliderTransition[state];
        return (
          <div ref={nodeRef} style={{ ...baseStyle, ...transitionStyles }}>
            {children}
          </div>
        );
      }}
    </Transition>
  );
};

const transitions = {

  expandRight: {
    getTransition: (duration = 300, intialValue, expandValue) => {
      const defaultStyles = {
        transition: `width ${duration}ms ease-in-out`,
        width: intialValue
      };

      const entering = { width: expandValue };
      const entered = { width: expandValue };
      const exiting = { width: intialValue };
      const exited = { width: intialValue };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
 
  expandBottom: {
    getTransition: (duration = 300, intialValue, expandValue) => {
      const defaultStyles = {
        transition: `height ${duration}ms ease-in-out`,
        height: intialValue
      };

      const entering = { height: expandValue };
      const entered = { height: expandValue };
      const exiting = { height: intialValue };
      const exited = { height: intialValue };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
};


export default Slider;



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