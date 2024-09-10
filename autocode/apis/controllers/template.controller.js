const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const { loadService } = require('../../loaders/servicesLoader')


const GetTemplate = catchAsync(async (req, res) => {
    const templateService = loadService('templateService');
    const template = await templateService.getTemplate(req.params.id);
    res.status(httpStatus.OK).send({ template });
});

const CreateTemplate = catchAsync(async (req, res) => {
    const templateService = loadService('templateService');
    const template = await templateService.createTemplate(req.body);
    res.status(httpStatus.CREATED).send({ template });
});

const UpdateTemplate = catchAsync(async (req, res) => {
    const templateService = loadService('templateService');
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.status(httpStatus.OK).send({ template });
});

const DeleteTemplate = catchAsync(async (req, res) => {
    const templateService = loadService('templateService');
    await templateService.deleteTemplate(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetTemplates = catchAsync(async (req, res) => {
    const templateService = loadService('templateService');
    const templates = await templateService.getTemplates();
    res.status(httpStatus.OK).send({ templates });
});

module.exports = {
    GetTemplate,
    CreateTemplate,
    UpdateTemplate,
    DeleteTemplate,
    GetTemplates,
};
