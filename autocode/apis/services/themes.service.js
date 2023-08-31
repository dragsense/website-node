const { Themes } = require('../models');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')


/**
 * Create a themes
 * @param {Object} themesBody
 * @returns {Promise<Themes>}
 */
const createThemes = async (themesBody) => {


    return;
};

/**
 * Update a themes
 * @param {String} id
 * @param {Object} themesBody
 * @returns {Promise<Themes>}
 */
const updateThemes = async (id, themesBody) => {

    return
};

/**
 * Get Themess
 * @returns {Promise<Themess>}
 */
const getThemess = async () => {
    return

};

/**
 * Delete a themes
 * @param {String} id
 * @returns {Promise<Themes>}
 */
const getThemes = async (id) => {
 
    return;
};


/**
 * Delete a themes
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteThemes = async (id) => {
    return id;
};

module.exports = {
    getThemess,
    getThemes,
    deleteThemes,
    updateThemes,
    createThemes
}