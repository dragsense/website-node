const httpStatus = require('http-status');
const pickKeys = require('../../utils/pick-keys');
const catchAsync = require('../../utils/catch-async');

// Load the necessary services dynamically
const { loadService } = require('../../loaders/servicesLoader')

const CreateMedia = catchAsync(async (req, res) => {
    const mediaService = loadService('mediaService');
    
    const file = req.file;
    const type = req.query.type;
    const media = await mediaService.createMedia(file, type);

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    res.status(httpStatus.CREATED).send({ media, host });
});

const UpdateMedia = catchAsync(async (req, res) => {
    const mediaService = loadService('mediaService');
    const media = await mediaService.updateMedia(req.params.id, req.body);
    res.status(httpStatus.OK).send({ media });
});

const DeleteMedia = catchAsync(async (req, res) => {
    const mediaService = loadService('mediaService');
    await mediaService.deleteMedia(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetMedia = catchAsync(async (req, res) => {
    const mediaService = loadService('mediaService');
    
    const filter = pickKeys(req.query, ['name', 'type']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const media = await mediaService.getMedia(filter, options);

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    res.status(httpStatus.OK).send({ media, host });
});

module.exports = {
    GetMedia,
    CreateMedia,
    UpdateMedia,
    DeleteMedia,
};
