const { Media } = require('../models');
const fs = require('fs');
const sizeOf = require('image-size');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')
const path = require('path');

const publicDir = path.resolve(__dirname, '../../', 'public/static/uploads');


/**
 * Create a media
 * @param {Object} file
 * @param {String} type
 * @param {String} host
 * @returns {Promise<Media>}
 */
const createMedia = async (file, type, host) => {

    const stats = fs.statSync(file.path);
    const fileSizeInBytes = stats.size;

    let dimensions = {};
    if (type === 'images') {
        dimensions = sizeOf(file.path);
    }

    const src = host + '/static/uploads/' + type + "/" + file.filename;

    const mediaBody = {
        src,
        fileName: file.filename,
        name: file.originalname,
        type,
        mimetype: file.mimetype,
        alt: file.originalname,
        size: fileSizeInBytes,
        dimensions,
    }

    return Media.create(mediaBody);
};

/**
 * Update a media
 * @param {String} id
 * @param {Object} mediaBody
 * @returns {Promise<Media>}
 */
const updateMedia = async (id, mediaBody) => {

    const media = await Media.findOne({ _id: id })
    if (!media) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
    }
    Object.assign(media, mediaBody);
    await media.save();
    return media;
};

/**
 * Get Media
 * @returns {Promise<Media[]>}
 */
const getMedia = async (filter, options) => {
    const projection = {
    };


    const pages = await Media.paginate(filter, options, projection);
    return pages;

};




/**
 * Delete a media
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteMedia = async (id) => {
    const media = await Media.findOneAndDelete({ _id: id })

    if (!media) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
      }
    
      const path = `${publicDir}/${media.type}/${media.fileName}`;
    
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
        }

        //file removed
    })


    return id;
};

module.exports = {
    getMedia,
    deleteMedia,
    updateMedia,
    createMedia
}