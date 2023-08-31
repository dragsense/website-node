const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')
const catchAsync = require('../../utils/catch-async')
const { Readable } = require('stream');

const { collectionService } = require('../services')

const GetCollection = catchAsync(async (req, res) => {
    const collection = await collectionService.getCollection(req.params.id);
    res.status(httpStatus.OK).send({ collection });
});


const GetPageData = catchAsync(async (req, res) => {
    const result = await collectionService.getPageData(req.params.id);
    res.status(httpStatus.OK).send(result);
});

const GetElements = catchAsync(async (req, res) => {


    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await collectionService.getElements(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetStyle = catchAsync(async (req, res) => {

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await collectionService.getStyle(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetCss = catchAsync(async (req, res) => {
    const css = await collectionService.getCss(req.params.id);
    res.status(httpStatus.OK).send(css);
});

const CreateCollection = catchAsync(async (req, res) => {
    const collection = await collectionService.createCollection(req.body);
    res.status(httpStatus.CREATED).send({ collection });
});

const DuplicateCollection = catchAsync(async (req, res) => {
    const collection = await collectionService.duplicateCollection(req.params.id);
    res.status(httpStatus.OK).send({ collection });
});

const UpdateCollection = catchAsync(async (req, res) => {
    const collection = await collectionService.updateCollection(req.params.id, req.body);
    res.status(httpStatus.OK).send({ collection });
});

const UpdateStyle = catchAsync(async (req, res) => {
    await collectionService.updateStyle(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const UpdateElements = catchAsync(async (req, res) => {
    await collectionService.updateElements(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const DeleteCollection = catchAsync(async (req, res) => {
    await collectionService.deleteCollection(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetCollections = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const collections = await collectionService.getCollections(filter, options);
    res.status(httpStatus.OK).send({ collections });
});

module.exports = {
    GetCollection,
    DuplicateCollection,
    CreateCollection,
    UpdateCollection,
    UpdateStyle,
    UpdateElements,
    DeleteCollection,
    GetCollections,
    GetPageData,
    GetCss,
    GetElements,
    GetStyle
};