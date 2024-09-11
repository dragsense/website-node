const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const pickKeys = require('../../utils/pick-keys');
const { Readable } = require('stream');

// Load the necessary services dynamically
const { loadService } = require('../../loaders/servicesLoader')

const GetLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    const layout = await layoutService.getLayout(req.params.id);
    res.status(httpStatus.OK).send({ layout });
});

const CreateLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    const withTemplate = req.query.withTemplate;
    const layout = await layoutService.createLayout(req.body, withTemplate);
    res.status(httpStatus.CREATED).send({ layout });
});

const UpdateLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    const layout = await layoutService.updateLayout(req.params.id, req.body);
    res.status(httpStatus.OK).send({ layout });
});

const DeleteLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    await layoutService.deleteLayout(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetElements = catchAsync(async (req, res) => {
    const settingService = loadService('settingService');

    const stream = new Readable({
        objectMode: true,
        read() {}
    });

    const protocol = 'https';
    const host = `${protocol}://${req.headers.host}`;

    await settingService.getElements(req.params.id, stream, 'layout', host);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetStyle = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');

    const stream = new Readable({
        objectMode: true,
        read() {}
    });

    await layoutService.getStyle(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetCss = catchAsync(async (req, res) => {
    const settingService = loadService('settingService');
    const css = await settingService.getCss(req.params.id, 'layout');
    res.status(httpStatus.OK).send(css);
});

const DuplicateLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    const layout = await layoutService.duplicateLayout(req.params.id);
    res.status(httpStatus.OK).send({ layout });
});

const PublishLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    await layoutService.publishLayout(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const RestoreLayout = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    await layoutService.restoreLayout(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const UpdateStyle = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    await layoutService.updateStyle(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const UpdateElements = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    await layoutService.updateElements(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const GetLayouts = catchAsync(async (req, res) => {
    const layoutService = loadService('layoutService');
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const layouts = await layoutService.getLayouts(filter, options);
    res.status(httpStatus.OK).send({ layouts });
});

module.exports = {
    GetLayout,
    CreateLayout,
    UpdateLayout,
    DeleteLayout,
    GetLayouts,
    GetElements,
    GetStyle,
    GetCss,
    UpdateElements,
    UpdateStyle,
    PublishLayout,
    DuplicateLayout,
    RestoreLayout
};
