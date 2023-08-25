const mongoose = require('mongoose');

const { toJSON, document, paginate } = require('./plugins')


const MediaSchema = new mongoose.Schema({
    src: {
        type: String,
    },
    
    name: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
    },
    type: {
        type: String,
    },
    alt: {
        type: String,
        default: "",
        required: true,

    },
    size: {
        type: Number,
        default: 0,
    },
    dimensions: {
        type: Object,
        default: {}
    },
    mimetype: {
        type: String,
        default: "",
    },
 
    default: {}
},
    { timestamps: true }

);

MediaSchema.plugin(paginate)

const Media = mongoose.model('AC_Media', MediaSchema);

module.exports = Media;