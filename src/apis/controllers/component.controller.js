const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')

const catchAsync = require('../../utils/catch-async')
const { componentService } = require('../services')

const { Readable } = require('stream');


const GetComponent = catchAsync(async (req, res) => {
    const component = await componentService.getComponent(req.params.id);
    res.status(httpStatus.OK).send({ component });
});

const GetPaths = catchAsync(async (req, res) => {
    const paths = await componentService.getPaths();
    res.status(httpStatus.OK).send({ paths });
});

const DuplicateComponent = catchAsync(async (req, res) => {
    const component = await componentService.duplicateComponent(req.params.id);
    res.status(httpStatus.OK).send({ component });
});

const CreateComponent = catchAsync(async (req, res) => {
    const component = await componentService.createComponent(req.body);
    res.status(httpStatus.CREATED).send({ component });
});

const UpdateComponent = catchAsync(async (req, res) => {
    const component = await componentService.updateComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ component });
});

const DeleteComponent = catchAsync(async (req, res) => {
    await componentService.deleteComponent(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetElements = catchAsync(async (req, res) => {


    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await componentService.getElements(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});



const GetStyle = catchAsync(async (req, res) => {

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
    await componentService.updateComponent(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const GetCss = catchAsync(async (req, res) => {
    const css = await componentService.getCss(req.params.id);
    res.status(httpStatus.OK).send(css);
});



const GetComponents = catchAsync(async (req, res) => {
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
    UpdateStyle,
    GetPaths
};