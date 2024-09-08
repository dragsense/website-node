const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const { loadService } = require('../../loaders/servicesLoader')

// Dynamically load the templateService
const getTemplateService = async () => {
    return await loadService('templateService');
};

const GetTemplate = catchAsync(async (req, res) => {
    const templateService = await getTemplateService();
    const template = await templateService.getTemplate(req.params.id);
    res.status(httpStatus.OK).send({ template });
});

const CreateTemplate = catchAsync(async (req, res) => {
    const templateService = await getTemplateService();
    const template = await templateService.createTemplate(req.body);
    res.status(httpStatus.CREATED).send({ template });
});

const UpdateTemplate = catchAsync(async (req, res) => {
    const templateService = await getTemplateService();
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.status(httpStatus.OK).send({ template });
});

const DeleteTemplate = catchAsync(async (req, res) => {
    const templateService = await getTemplateService();
    await templateService.deleteTemplate(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetTemplates = catchAsync(async (req, res) => {
    const templateService = await getTemplateService();
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
