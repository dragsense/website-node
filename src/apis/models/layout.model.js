const mongoose = require('mongoose');
const { toJSON, document, paginate } = require('./plugins')
const Schema = mongoose.Schema;


const LayoutSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        topComponent: {
            type: Boolean,
            default: false,
        },
        bottomComponent: {
            type: Boolean,
            default: false,
        },
        components: {
            type: {
                top: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'AC_Component',
                    default: null,
                },
                bottom: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'AC_Component',
                    default: null,
                },
                _id: false
            },
            default: {}
        },
        updater: {
            type: Object,
            default: {},
        },
        creator: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

LayoutSchema.plugin(paginate)
LayoutSchema.plugin(document);


const Layout = mongoose.model('AC_Layout', LayoutSchema);

module.exports = Layout;