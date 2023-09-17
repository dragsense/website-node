import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transition } from 'react-transition-group';

const SIDES = [
    'topRight',
    'topLeft',
    'bottomLeft',
    'bottomRight',
  ];

const Dropdown = ({ 
    children, 
     type,
    duration,
    openSide,
    openDropdown,
    closeDropdown,
    expandable,
    leftOffset,
    topOffset,
    intialValue, expandValue }) => {
  const nodeRef = useRef(null);

  const transitionType = expandable ? type : 'fade';


  const dropdownTransition = transitions[transitionType].getTransition(duration, intialValue, expandValue);

  const iframe = document.querySelector("#ac-editor-iframe-doc");
  const window = iframe.contentWindow;

 


  useEffect(() => {
    const handleClickOutside = (event) => {
     
      if (nodeRef.current && !nodeRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
   // window.addEventListener('click', handleClickOutside);
  
    return () => {
      //window.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <Transition nodeRef={expandable} in={openDropdown} timeout={duration}>
      {state => {
        const baseStyle = {
          position: expandable ? 'relative' : 'absolute',
          [openSide]: 0,
          visibility:  openDropdown ? 'visible' : 'hidden',
          left: openSide.includes('Left') ? leftOffset : 'auto',
          right: openSide.includes('Right') ? leftOffset : 'auto',
          top: openSide.includes('top') ? topOffset : 'auto',
          bottom: openSide.includes('bottom') ? topOffset : 'auto',
          width: 'auto',
          height: 'auto',
          ...dropdownTransition.defaultStyles,
        };
        const transitionStyles =  dropdownTransition[state];
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

  expandRight: {
    getTransition: (duration = 300, intialValue, expandValue) => {
      const defaultStyles = {
        transition: `width ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
        width: intialValue,
        opacity: 0,
      };

      const entering = { width: expandValue, opacity: 1 };
      const entered = { width: expandValue, opacity: 1 };
      const exiting = { width: intialValue, opacity: 0 };
      const exited = { width: intialValue, opacity: 0 };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
 
  expandBottom: {
    getTransition: (duration = 300, intialValue, expandValue) => {
      const defaultStyles = {
        transition: `height ${duration}ms ease-in-out,  opacity ${duration}ms ease-in-out`,
        height: intialValue
      };

      const entering = { height: expandValue, opacity: 1 };
      const entered = { height: expandValue, opacity: 1 };
      const exiting = { height: intialValue, opacity: 0 };
      const exited = { height: intialValue, opacity: 0 };

      return { defaultStyles, entering, entered, exiting, exited };
    },
  },
};


export default Dropdown;



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