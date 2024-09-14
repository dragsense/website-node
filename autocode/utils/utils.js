const { exec } = require('child_process');
const he = require('he');

const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return reject(new Error(stderr || error.message));
    }
    console.log(`stdout: ${stdout}`);
      resolve({ stdout, stderr });
    });
  });
};




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

// Function to generate CSS for elements
const generateElementsCss = (elements, _id) => {
  let css = '';

  // If no elements, return empty string
  if (!elements)
    return css;

  // Iterate over each element
  Object.keys(elements).map((key) => {
    const style = elements[key].style || {};
    const selectorText = elements[key].selectorText;

    // If selectorText exists, generate CSS
    if (selectorText)
      css += generateElementCss(style, selectorText);
  });

  return css;
}

// Function to generate CSS for a single element
const generateElementCss = (style, selectorText) => {
  let css = '';

  Object.keys(style).map((key) => {
    if (style[key]) {
      if (key !== 'normal')
        css += '@media ' + key + ' {\n';
      const s = style[key];
      css += generateStyleCss(s, selectorText);

      if (key !== 'normal')
        css += ' }\n';
    }
  });

  return css;
}

// Function to generate CSS for a single style
const generateStyleCss = (s, selectorText) => {
  let css = '';

  Object.keys(s).map((key) => {
    let properties = Object.entries(s[key].properties || {}).map(([key, property]) => `${key}: ${property.value} ${property.priority ? "!important" : ""}`).join(';');

    let selector = key !== 'root' ? selectorText + key : selectorText
    if(properties.trim())
    css += `${selector} {\n  ${properties}\n}\n\n`;
  });

  return css;
}

// Function to generate a random key
const generateRandomKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Function to generate CSS
const generateCss = (styles) => {
  let css = '';

  // If no styles, return empty string
  if (!styles)
    return css;

  // Iterate over each style
  Object.keys(styles).map((key) => {
    if (styles[key]) {
      css += generateStyleCss(styles[key], key);
    }
  });

  return css;
}

// Function to generate animations
const generateAnimations = (elements) => {
  let css = '';

  // If no elements, return empty string
  if (!elements)
    return css;

  // Iterate over each element
  Object.keys(elements).map((key) => {
    const style = elements[key].style || {};
    css += generateAnimationCss(elements[key].name, style);
  });

  return css;
}

// Function to generate CSS for a single animation
const generateAnimationCss = (name, s) => {
  let css = '';

  css += `@keyframes ${name}` + ' {\n';


  Object.keys(s).map((key) => {
    let properties = Object.entries(s[key].properties || {}).map(([key, property]) => `${key}: ${property.value} ${property.priority ? "!important" : ""}`).join(';');
    css += `${key} {\n  ${properties}\n}\n\n`;
  });
  css += ' }\n';

  return css;
}

// Function to generate animation names
const generateAnimationNames = (elements) => {
  let names = [];

  // If no elements, return empty array
  if (!elements)
    return names;

  // Iterate over each element and add its name to the array
  Object.keys(elements).map((key) => {
    names.push(elements[key].name);
  });
  return names;
}


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
  executeCommand,
  generateCss,
  generateRandomKey,
  throttle,
  debounce,
  updateContentWithType,
  formatDate,
  getCurrentDate,
  generateElementsCss,
  generateAnimationNames,
  generateAnimations,
}
