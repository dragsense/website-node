const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')

const catchAsync = require('../../utils/catch-async')

const { Readable } = require('stream');

const { loadService } = require('../../loaders/servicesLoader')


const GetComponent = catchAsync(async (req, res) => {
    
    const componentService =loadService('componentService');
    const component = await componentService.getComponent(req.params.id);

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    res.status(httpStatus.OK).send({ component, host });
});

const GetPaths = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const paths = await componentService.getPaths();
    res.status(httpStatus.OK).send({ paths });
});

const DuplicateComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const component = await componentService.duplicateComponent(req.params.id);
    res.status(httpStatus.OK).send({ component });
});

const CreateComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const component = await componentService.createComponent(req.body);
    res.status(httpStatus.CREATED).send({ component });
});

const PublishComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    await componentService.publishComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const RestoreComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    await componentService.restoreComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});



const UpdateComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const component = await componentService.updateComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ component });
});

const UpdateElements = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const component = await componentService.updateElements(req.params.id, req.body);
    res.status(httpStatus.OK).send({ component });
});


const DeleteComponent = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    await componentService.deleteComponent(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetElements = catchAsync(async (req, res) => {

    const settingService = loadService('settingService');

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    await settingService.getElements(req.params.id, stream, 'component', host);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});



const GetStyle = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await componentService.getStyle(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const UpdateStyle = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    await componentService.updateComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const GetCss = catchAsync(async (req, res) => {
    const settingService = loadService('settingService');

    const css = await settingService.getCss(req.params.id, 'component');
    res.status(httpStatus.OK).send(css);
});



const GetComponents = catchAsync(async (req, res) => {
    const componentService =loadService('componentService');

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const components = await componentService.getComponents(filter, options);
    res.status(httpStatus.OK).send({ components });
});

module.exports = {
    GetComponent,
    DuplicateComponent,
    CreateComponent,
    UpdateComponent,
    DeleteComponent,
    GetComponents,
    GetStyle,
    GetElements,
    GetCss,
    PublishComponent,
    RestoreComponent,
    UpdateElements,
    UpdateStyle,
    GetPaths
};