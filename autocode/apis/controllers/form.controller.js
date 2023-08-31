const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')
const { Readable } = require('stream');

const catchAsync = require('../../utils/catch-async')
const { formService } = require('../services')

const GetForm = catchAsync(async (req, res) => {
    const form = await formService.getForm(req.params.id);
    res.status(httpStatus.OK).send({ form });
});

const GetElements = catchAsync(async (req, res) => {


    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await formService.getElements(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetStyle = catchAsync(async (req, res) => {

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    await formService.getStyle(req.params.id, stream);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
});

const GetCss = catchAsync(async (req, res) => {
    const css = await formService.getCss(req.params.id);
    res.status(httpStatus.OK).send(css);
});

const CreateForm = catchAsync(async (req, res) => {
    const form = await formService.createForm(req.body);
    res.status(httpStatus.CREATED).send({ form });
});

const DuplicateForm = catchAsync(async (req, res) => {
    const form = await formService.duplicateForm(req.params.id);
    res.status(httpStatus.OK).send({ form });
});

const UpdateForm = catchAsync(async (req, res) => {
    const form = await formService.updateForm(req.params.id, req.body);
    res.status(httpStatus.OK).send({ form });
});

const UpdateStyle = catchAsync(async (req, res) => {
    await formService.updateStyle(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const UpdateElements = catchAsync(async (req, res) => {
    await formService.updateElements(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

const DeleteForm = catchAsync(async (req, res) => {
    await formService.deleteForm(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetForms = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const forms = await formService.getForms(filter, options);
    res.status(httpStatus.OK).send({ forms });
});


const Submit = catchAsync(async (req, res) => {
    await formService.submit(req.params.id, req.body);
    res.status(httpStatus.OK).send({ status: true });
});

module.exports = {
    GetForm,
    Submit,
    CreateForm,
    DuplicateForm,
    UpdateForm,
    DeleteForm,
    GetForms,
    GetCss,
    GetElements,
    UpdateElements,
    UpdateStyle,
    GetStyle,
};