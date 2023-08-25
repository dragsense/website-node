const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')

const catchAsync = require('../../utils/catch-async')
const { mediaService } = require('../services')


const CreateMedia = catchAsync(async (req, res) => {

    const file = req.file;
    const type = req.query.type;
    const host = `${req.protocol}://${req.headers.host}`;
    const media = await mediaService.createMedia(file, type, host);
    res.status(httpStatus.CREATED).send({ media });
});

const UpdateMedia = catchAsync(async (req, res) => {
    const media = await mediaService.updateMedia(req.params.id, req.body);
    res.status(httpStatus.OK).send({ media });
});

const DeleteMedia = catchAsync(async (req, res) => {
    await mediaService.deleteMedia(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetMedia = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name', 'type']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const media = await mediaService.getMedia(filter, options);
    res.status(httpStatus.OK).send({ media });
});

module.exports = {
    GetMedia,
    CreateMedia,
    UpdateMedia,
    DeleteMedia,
};