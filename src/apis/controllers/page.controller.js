const httpStatus = require('http-status')
const { Readable } = require('stream');

const catchAsync = require('../../utils/catch-async')
const pickKeys = require('../../utils/pick-keys')

const { pageService } = require('../services');

const GetPage = catchAsync(async (req, res) => {
    const page = await pageService.getPage(req.params.id);
    res.status(httpStatus.OK).send({ page });
});

const GetPageData = catchAsync(async (req, res) => {
    const result = await pageService.getPageData(req.params.id);
    res.status(httpStatus.OK).send(result);
});

const GetElements = catchAsync(async (req, res) => {


    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await pageService.getElements(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetStyle = catchAsync(async (req, res) => {

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await pageService.getStyle(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetCss = catchAsync(async (req, res) => {
    const css = await pageService.getCss(req.params.id);
    res.status(httpStatus.OK).send(css);
});


const DuplicatePage = catchAsync(async (req, res) => {
    const page = await pageService.duplicatePage(req.params.id);
    res.status(httpStatus.OK).send({ page });
});

const CreatePage = catchAsync(async (req, res) => {
    const page = await pageService.createPage(req.body);
    res.status(httpStatus.CREATED).send({ page });
});

const UpdatePage = catchAsync(async (req, res) => {
    const page = await pageService.updatePage(req.params.id, req.body);
    res.status(httpStatus.OK).send({ page });
});

const UpdateStyle = catchAsync(async (req, res) => {
    await pageService.updateStyle(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const UpdateElements = catchAsync(async (req, res) => {
    await pageService.updateElements(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const DeletePage = catchAsync(async (req, res) => {
    await pageService.deletePage(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetPages = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const pages = await pageService.getPages(filter, options);
    res.status(httpStatus.OK).send({ pages });
});

module.exports = {
    GetPage,
    GetPageData,
    GetCss,
    GetElements,
    UpdateElements,
    UpdateStyle,
    GetStyle,
    DuplicatePage,
    CreatePage,
    UpdatePage,
    DeletePage,
    GetPages,
};