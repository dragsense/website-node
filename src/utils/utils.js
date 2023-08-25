// const { exec } = require('child_process');

// const executeCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(new Error(`Error executing command: ${error.message}`));
//         return;
//       }

//       resolve({ stdout, stderr });
//     });
//   });
// };
const he = require('he');




const getCurrentDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  return `${day}-${month}-${year}`;
};


function formatDate(dateString, format) {
  const date = new Date(dateString);

  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  if (format === 'YYYY-MM-DD') {
    return formattedDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2');
  } else if (format === 'MM/DD/YYYY') {
    return formattedDate;
  } else if (format === 'DD/MM/YYYY') {
    return formattedDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3');
  } else if (format === 'YYYY/MM/DD') {
    return formattedDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3/$1/$2');
  } else if (format === 'Month D, YYYY') {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } else if (format === 'D MMM, YYYY') {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } else if (format === 'MMMM DD, YYYY') {
    const options = { month: 'long', day: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } else if (format === 'DD MMM, YYYY') {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } else {
    return formattedDate;
  }
}


function updateContentWithType(object, type) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const value = object[key];

      if (value.states) {
        updateContentWithType(value.states, type);
      } 
      
      if (value.type === type) {
        value.defaultValue = he.decode(value.defaultValue);
      }
    }
  }
}

const generateElementsCss = (elements, _id) => {
  let css = '';

  if (!elements)
    return css;

  Object.keys(elements).map((key) => {

    const style = elements[key].style || {};
    const selectorText = elements[key].selectorText;

    if(selectorText)
    Object.keys(style).map((key) => {
      if (style[key]) {
        if (key !== 'normal')
          css += '@media ' + key + ' {\n';
        const s = style[key];
        Object.keys(s).map((key) => {
          let properties = Object.entries(s[key].properties || {}).map(([key, property]) => `${key}: ${property.value} ${property.priority ? "!important": "" }`).join(';');
        
          let selector = key !== 'root' ? selectorText+key : selectorText
          css += `${selector} {\n  ${properties}\n}\n\n`;

        });

        if (key !== 'normal')
          css += ' }\n';
      }
    });
  });

  return css;
}

const generateRandomKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};


const generateCss = (styles) => {
  let css = '';

  if (!styles)
    return css;

  Object.keys(styles).map((key) => {
    if (styles[key]) {
      if (key !== 'normal')
        css += '@media ' + key + ' {\n';
      Object.values(styles[key]).flatMap((element) => {


        Object.values(element.selectors).map(selector => {
          let properties = Object.entries(selector.properties).map(([key, property]) => `${key}: ${property.value}`).join(';');
          css += `${selector.selectorText} {\n  ${properties}\n}\n\n`;
        }).join('');

      });

      if (key !== 'normal')
        css += ' }\n';
    }
  });

  return css;
}


const generateAnimations = (elements) => {


  let css = '';

  if (!elements)
    return css;

  Object.keys(elements).map((key) => {

    const style = elements[key].style || {};


    css += `@keyframes ${elements[key].name}` + ' {\n';

    Object.keys(style).map((key) => {
      if (style[key]) {
        const s = style[key];
        let properties = Object.entries(s.properties || {}).map(([key, property]) => `${key}: ${property.value}`).join(';');
        css += `${s.selectorText} {\n  ${properties}\n}\n\n`;



      }
    });
  });
  css += ' }\n';


  return css;


}


const generateAnimationNames = (elements) => {

  let names = [];

  if (!elements)
    return names;

  Object.keys(elements).map((key) => {
    names.push(elements[key].name);
  });
  return names;

}

const getPaginationRange = (currentPage, totalPages, pagination) => {
  let leftRangeLength = pagination.leftRange || 1;
  let rightRangeLength = pagination.rightRange || 1;
  const rangeSize = pagination.nearRange || 2;

  const dots = pagination.dots || "...";

  let start = Math.max(currentPage - rangeSize, 1);
  let end = Math.min(currentPage + rangeSize, totalPages);

  if (leftRangeLength > totalPages) {
    leftRangeLength = totalPages;
    rightRangeLength = 0;
  }

  if (rightRangeLength + leftRangeLength > totalPages) {
    rightRangeLength = totalPages - leftRangeLength;
  }


  if (start === 1) {
    end = Math.min(start + rangeSize * 2, totalPages);
  } else if (end === totalPages) {
    start = Math.max(end - rangeSize * 2, 1);
  }

  const leftRange = [];
  const rightRange = [];

  for (let i = 1; i <= leftRangeLength; i++) {
    leftRange.push(i);
  }

  if (start > leftRangeLength + 1) {
    leftRange.push(dots);
  }

  if (end < totalPages - rightRangeLength) {
    rightRange.push(dots);
  }

  for (let i = totalPages - rightRangeLength + 1; i <= totalPages; i++) {
    rightRange.push(i);
  }

  const nearbyRange = [];

  const startIndex = start > leftRangeLength ? start : leftRangeLength + 1;

  const endIndex = end < totalPages - rightRangeLength + 1 ? end : end - rightRangeLength;
  for (let i = startIndex; i <= endIndex; i++) {
    nearbyRange.push(i);
  }

  return [...leftRange, ...nearbyRange, ...rightRange];
};


function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}


function debounce(func, wait) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}


module.exports = {
  // executeCommand,
  generateCss,
  generateRandomKey,
  throttle,
  debounce,
  getPaginationRange,
  updateContentWithType,
  formatDate,
  getCurrentDate,
  generateElementsCss,
  generateAnimationNames,
  generateAnimations,
}
