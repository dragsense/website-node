const fsUtils = require('../../utils/fs-utils');
const { generateCss, generateElementsCss, generateAnimations, generateAnimationNames } = require('../../utils/utils');

const shortid = require('shortid');
const httpStatus = require('http-status')
const he = require('he');

const path = require('path');
const dataDir = path.resolve(__dirname, '..', 'data');

const ApiError = require('../../utils/api-error');


const paginate = (data, filter, options) => {

  const page = parseInt(options['page']) || 1;
  const limit = parseInt(options['limit']) || 10;
  const sortBy = options['sortBy'] || 'asc'; // Default to ascending order if sortBy is not provided

  let filteredData = data;

  if (filter['name']) {
    const nameFilterRegex = new RegExp(filter['name'], 'i'); // 'i' flag for case-insensitive search
    filteredData = filteredData.filter(data => nameFilterRegex.test(data.name));
  }

  const total = filteredData.length;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (sortBy === 'asc') {
    paginatedData.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'desc') {
    paginatedData.sort((a, b) => b.name.localeCompare(a.name));
  }

  return {
    data: paginatedData,
    total: Math.ceil(total / limit),
  };
}


/**
 * Create a color
 * @param {Object} colorBody
 * @returns {Promise<Color>}
 */
const createColor = async (colorBody) => {
  const { name } = colorBody;


  const data = await fsUtils.read(path.join(dataDir, 'colors.json'));
  const colors = JSON.parse(data || '{}');



  if (Object.values(colors).find((color) => color.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  const _uid = shortid.generate();
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-color`

  colors[_uid] = {
    ...colorBody,
    variable,
    _uid,

  };

  await fsUtils.write(path.join(dataDir, 'colors.json'), JSON.stringify(colors, null, 4));

  return colors[_uid];
};

/**
 * Update a color
 * @param {String} _uid
 * @param {Object} colorBody
 * @returns {Promise<Color>}
 */
const updateColor = async (_uid, colorBody) => {



  const { name } = colorBody;

  const data = await fsUtils.read(path.join(dataDir, 'colors.json'));
  const colors = JSON.parse(data || '{}');

  if (!colors[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Color not found');
  }

  if (Object.values(colors).some((color) => color._uid !== _uid && color.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-color`

  colors[_uid] = {
    ...colors[_uid],
    ...colorBody,
    variable
  };

  await fsUtils.write(path.join(dataDir, 'colors.json'), JSON.stringify(colors, null, 4));

  return colors[_uid];
};

/**
 * Get Colors
 * @returns {Promise<Color[]>}
 */
const getColors = async (filter, options) => {

  const data = await fsUtils.read(path.join(dataDir, 'colors.json'));
  const colors = Object.values(JSON.parse(data || "{}"));

  const paginatedData = paginate(colors, filter, options)
  return paginatedData;

};

/**
 * Delete a color
 * @param {String} _uid
 * @returns {Promise<Color>}
 */
const deleteColor = async (_uid) => {

  const data = await fsUtils.read(path.join(dataDir, 'colors.json'));
  const colors = JSON.parse(data || '{}');

  if (!colors[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Color not found');
  }

  delete colors[_uid];

  await fsUtils.write(path.join(dataDir, 'colors.json'), JSON.stringify(colors, null, 4));

  return _uid;
};




/**
 * Create a font
 * @param {Object} fontBody
 * @returns {Promise<Font>}
 */
const createFont = async (fontBody) => {
  const { name } = fontBody;


  const data = await fsUtils.read(path.join(dataDir, 'fonts.json'));
  const fonts = JSON.parse(data || '{}');

  if (fonts.length >= 25) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Font limit reached. You cannot add more fonts.");
  }

  if (Object.values(fonts).find((font) => font.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  const _uid = shortid.generate();
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-font`

  if (fontBody.src)
    fontBody.src = he.decode(fontBody.src || '')


  fonts[_uid] = {
    ...fontBody,
    variable,
    _uid,

  };


  await fsUtils.write(path.join(dataDir, 'fonts.json'), JSON.stringify(fonts, null, 4));

  return fonts[_uid];
};

/**
 * Update a font
 * @param {String} _uid
 * @param {Object} fontBody
 * @returns {Promise<Font>}
 */
const updateFont = async (_uid, fontBody) => {



  const { name } = fontBody;

  const data = await fsUtils.read(path.join(dataDir, 'fonts.json'));
  const fonts = JSON.parse(data || '{}');

  if (!fonts[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Font not found');
  }

  if (Object.values(fonts).some((font) => font._uid !== _uid && font.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-font`

  if (fontBody.src)
    fontBody.src = he.decode(fontBody.src || '')


  fonts[_uid] = {
    ...fonts[_uid],
    ...fontBody,
    variable
  };

  await fsUtils.write(path.join(dataDir, 'fonts.json'), JSON.stringify(fonts, null, 4));

  return fonts[_uid];
};

/**
 * Get Fonts
 * @returns {Promise<Font[]>}
 */
const getFonts = async (filter, options) => {

  const data = await fsUtils.read(path.join(dataDir, 'fonts.json'));
  const fonts = Object.values(JSON.parse(data || "{}"));

  const paginatedData = paginate(fonts, filter, options)
  return paginatedData;

};

/**
 * Delete a font
 * @param {String} _uid
 * @returns {Promise<Font>}
 */
const deleteFont = async (_uid) => {
  const data = await fsUtils.read(path.join(dataDir, 'fonts.json'));
  const fonts = JSON.parse(data || '{}');

  if (!fonts[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Font not found');
  }

  delete fonts[_uid];
  await fsUtils.write(path.join(dataDir, 'fonts.json'), JSON.stringify(fonts, null, 4));

  return _uid;
};


/**
 * Create a variable
 * @param {Object} variableBody
 * @returns {Promise<Variable>}
 */
const createVariable = async (variableBody) => {
  const { name } = variableBody;


  const data = await fsUtils.read(path.join(dataDir, 'variables.json'));
  const variables = JSON.parse(data || '{}');


  if (Object.values(variables).find((variable) => variable.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  const _uid = shortid.generate();
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-variable`

  variables[_uid] = {
    ...variableBody,
    variable,
    _uid,

  };


  await fsUtils.write(path.join(dataDir, 'variables.json'), JSON.stringify(variables, null, 4));

  return variables[_uid];
};

/**
 * Update a variable
 * @param {String} _uid
 * @param {Object} variableBody
 * @returns {Promise<Variable>}
 */
const updateVariable = async (_uid, variableBody) => {



  const { name } = variableBody;


  const data = await fsUtils.read(path.join(dataDir, 'variables.json'));
  const variables = JSON.parse(data || '{}');

  if (!variables[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }

  if (Object.values(variables).some((variable) => variable._uid !== _uid && variable.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  const variable = `--var-${name.toLowerCase().replace(/\s+/g, '-')}-variable`

  variables[_uid] = {
    ...variables[_uid],
    ...variableBody,
    variable
  };

  await fsUtils.write(path.join(dataDir, 'variables.json'), JSON.stringify(variables, null, 4));

  return variables[_uid];
};

/**
 * Get Variables
 * @returns {Promise<Variable[]>}
 */
const getVariables = async (filter, options) => {


  const data = await fsUtils.read(path.join(dataDir, 'variables.json'));
  const variables = Object.values(JSON.parse(data || "{}"));

  const paginatedData = paginate(variables, filter, options)
  return paginatedData;
};

/**
 * Delete a variable
 * @param {String} _uid
 * @returns {Promise<Variable>}
 */
const deleteVariable = async (_uid) => {

  const data = await fsUtils.read(path.join(dataDir, 'variables.json'));
  const variables = JSON.parse(data || '{}');

  if (!variables[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }

  delete variables[_uid];
  await fsUtils.write(path.join(dataDir, 'variables.json'), JSON.stringify(variables, null, 4));

  return _uid;
};



/**
 * Create a icon
 * @param {Object} iconBody
 * @returns {Promise<Icon>}
 */
const createIcon = async (iconBody) => {
  const { name } = iconBody;

  const data = await fsUtils.read(path.join(dataDir, 'icons.json'));
  const icons = JSON.parse(data || '{}');

  if (Object.values(icons).some((icon) => icon.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  const _uid = shortid.generate();

  if (iconBody.svg) {
    iconBody.svg = he.decode(iconBody.svg || '')
  }

  icons[_uid] = {
    ...iconBody,
    _uid,

  };



  await fsUtils.write(path.join(dataDir, 'icons.json'), JSON.stringify(icons, null, 4));

  return icons[_uid];
};

/**
 * Update a icon
 * @param {String} _uid
 * @param {Object} iconBody
 * @returns {Promise<Icon>}
 */
const updateIcon = async (_uid, iconBody) => {



  const { name } = iconBody;


  const data = await fsUtils.read(path.join(dataDir, 'icons.json'));
  const icons = JSON.parse(data || '{}');

  if (!icons[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Icon not found');
  }

  if (Object.values(icons).some((icon) => icon._uid !== _uid && icon.name === name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  if (iconBody.svg) {
    iconBody.svg = he.decode(iconBody.svg || '')
  }
  icons[_uid] = {
    ...icons[_uid],
    ...iconBody
  };

  await fsUtils.write(path.join(dataDir, 'icons.json'), JSON.stringify(icons, null, 4));

  return icons[_uid];
};

/**
 * Get Icons
 * @returns {Promise<Icon[]>}
 */
const getIcons = async (filter, options) => {
  const data = await fsUtils.read(path.join(dataDir, 'icons.json'));
  let icons = Object.values(JSON.parse(data || "{}"));

  const paginatedData = paginate(icons, filter, options)
  return paginatedData;
};

/**
 * Delete a Icon
 * @param {String} _uid
 * @returns {Promise<Icon>}
 */
const deleteIcon = async (_uid) => {


  const data = await fsUtils.read(path.join(dataDir, 'icons.json'));
  const icons = JSON.parse(data || '{}');

  if (!icons[_uid]) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Icon not found');
  }

  delete icons[_uid];

  await fsUtils.write(path.join(dataDir, 'icons.json'), JSON.stringify(icons, null, 4));

  return _uid;
};



/**
 * Save a Style
 * @param {Object} styleBody
 * @returns {Promise<Style>}
 */
const saveStyle = async (styleBody) => {

  const { styles } = styleBody;


  await fsUtils.write(path.join(dataDir, 'style.json'), JSON.stringify(styles, null, 4));

  return { status: true };
}


/**
 * Get a Style
 * @param
 * @returns {Promise<Style>}
 */
const getStyle = async (_id, stream) => {

  const data = await fsUtils.read(path.join(dataDir, 'style.json'));
  const style = JSON.parse(data || '{}');

  if (Object.keys(style || {}).length > 0) {
    const chunkStr = JSON.stringify({_id, elements: style}) + '\n';
    stream.push(chunkStr);
  }


  stream.push(null);
}

/**
 * Save Animations
 * @param {Object} aniamtionsBody
 * @returns {Promise<Aniamtions>}
 */
const saveAnimations = async (aniamtionsBody) => {

  const { styles } = aniamtionsBody;

  await fsUtils.write(path.join(dataDir, 'animation.json'), JSON.stringify(styles, null, 4));

  return { status: true };
}


/**
 * Get Animations
 * @param
 * @returns {Promise<Aniamtions>}
 */
const getAnimations = async (_id, stream) => {

  const data = await fsUtils.read(path.join(dataDir, 'animation.json'));
  const style = JSON.parse(data || '{}');
  if (Object.keys(style || {}).length > 0) {
    const chunkStr = JSON.stringify({_id, elements: style}) + '\n';
    stream.push(chunkStr);
  }


  stream.push(null);
}

/**
 * Get Animations Names
 * @param
 * @returns {Promise<Names>}
 */
const getAnimationsNames = async () => {

  const data = await fsUtils.read(path.join(dataDir, 'animation.json'));
  const animation = JSON.parse(data || '{}');

  const names = generateAnimationNames(animation)

  return names;
}


/**
 * Save a Css
 * @param {Object} cssBody
 * @returns {Promise<Style>}
 */
const saveCss = async (cssBody) => {

  const { code } = cssBody;

  await fsUtils.write(path.join(dataDir, 'customStyle.css'), code);
  return { status: true };
}

/**
 * Save a Custom Css
 * @param
 * @returns {Promise<Style>}
 */
const getCsutomCss = async () => {
  const code = await fsUtils.read(path.join(dataDir, 'customStyle.css'));
  return { code }

}

/**
 * Get Animations Css
 * @param
 * @returns {Promise<CSS>}
 */
const getAnimationsCss = async () => {
  const data = await fsUtils.read(path.join(dataDir, 'animation.json'));

  const animation = JSON.parse(data || '{}');
  const css = generateAnimations(animation)
  return { css }

}


/**
 * Get a Css
 * @param
 * @returns {Promise<Style>}
 */
const getCss = async () => {
  const code = await fsUtils.read(path.join(dataDir, 'customStyle.css'));

  let css = code;


  const data = await fsUtils.read(path.join(dataDir, 'style.json'));
  const styles = JSON.parse(data || '{}');

  css += generateElementsCss(styles)

  const animData = await fsUtils.read(path.join(dataDir, 'animation.json'));
  const aniamtion = JSON.parse(animData || '{}');

  css += generateAnimations(aniamtion.elements)

  return { css }

}


/**
 * Create a Js
 * @param {Object} jsBody
 * @returns {Promise<Js>}
 */
const saveJs = async (jsBody) => {

  const { code } = jsBody;

  await fsUtils.write(path.join(dataDir, 'customJs.js'), code);
  return { status: true };
}


/**
 * Get a Js
 * @param
 * @returns {Promise<Js>}
 */
const getJs = async () => {
  const code = await fsUtils.read(path.join(dataDir, 'customJs.js'));
  return { code }

}



module.exports = {
  saveAnimations,
  getAnimations,
  getAnimationsNames,
  getAnimationsCss,
  saveCss,
  getCsutomCss,
  getCss,
  getJs,
  saveJs,
  getStyle,
  saveStyle,
  getVariables,
  deleteVariable,
  updateVariable,
  createVariable,
  getFonts,
  deleteFont,
  updateFont,
  createFont,
  getColors,
  deleteColor,
  updateColor,
  createColor,
  getIcons,
  deleteIcon,
  updateIcon,
  createIcon,
};