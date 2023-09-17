

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





const generateRandomKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};






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


function getFileExtension(filename) {
  // Use the lastIndexOf method to find the last dot in the filename
  const lastDotIndex = filename.lastIndexOf('.');
  
  // Check if a dot was found and if it's not the last character in the string
  if (lastDotIndex !== -1 && lastDotIndex < filename.length - 1) {
    // Use substring to get the text after the last dot
    return filename.substring(lastDotIndex + 1);
  } else {
    // No dot or dot is the last character (no extension)
    return '';
  }
}


module.exports = {
  // executeCommand,
  getFileExtension,
  generateRandomKey,
  throttle,
  debounce,
  getPaginationRange,
  formatDate,
  getCurrentDate,
}
