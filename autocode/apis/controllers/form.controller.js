const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')
const { Readable } = require('stream');

const catchAsync = require('../../utils/catch-async')
const { formService, settingService } = require('../services')

const GetForm = catchAsync(async (req, res) => {
    const form = await formService.getForm(req.params.id);
    res.status(httpStatus.OK).send({ form });
});

const GetElements = catchAsync(async (req, res) => {


    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    await settingService.getElements(req.params.id, stream, 'form', host);

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
    const css = await settingService.getCss(req.params.id, 'form');
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

const PublishForm = catchAsync(async (req, res) => {
    await formService.publishForm(req.params.id, req.body);
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
    // Extract files from the request
    let files = req.files;

    // Initialize an array to hold updated file information
    const updatedFiles = [];

    // Check if files exist in the request
    if (files) {
        // Use map instead of for loop for better performance
        files.map(file => {
            // Determine the type of the file based on its mimetype
            const type = determineFileType(file.mimetype.toLowerCase());

            // Push the updated file information to the array
            updatedFiles.push({ file, type });
        });
    }

    // Submit the updated files to the form service
    await formService.submit(updatedFiles, req.params.id, req.body);

    // Send a response with a status of true
    res.status(httpStatus.OK).send({ status: true });
});

// Helper function to determine the file type based on the mimetype
const determineFileType = (mimetype) => {
    let type = 'docs';

    if (mimetype.startsWith('image')) {
        type = 'images';
    } else if (mimetype.startsWith('video')) {
        type = 'videos';
    } else if (mimetype.startsWith('audio')) {
        type = 'audios';
    }

    return type;
};

module.exports = {
    GetForm,
    Submit,
    CreateForm,
    DuplicateForm,
    UpdateForm,
    PublishForm,
    DeleteForm,
    GetForms,
    GetCss,
    GetElements,
    UpdateElements,
    UpdateStyle,
    GetStyle,
};