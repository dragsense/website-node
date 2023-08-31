const httpStatus = require('http-status')

const catchAsync = require('../../utils/catch-async')
const { themesService } = require('../services')

const GetThemes = catchAsync(async (req, res) => {
    const themes = await themesService.getThemes(req.params.id);
    res.status(httpStatus.OK).send({ themes });
});

const CreateThemes = catchAsync(async (req, res) => {
    const themes = await themesService.createThemes(req.body);
    res.status(httpStatus.CREATED).send({ themes });
});

const UpdateThemes = catchAsync(async (req, res) => {
    const themes = await themesService.updateThemes(req.params.id, req.body);
    res.status(httpStatus.OK).send({ themes });
});

const DeleteThemes = catchAsync(async (req, res) => {
    await themesService.deleteThemes(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetThemess = catchAsync(async (req, res) => {
    const themess = await themesService.getThemess();
    res.status(httpStatus.OK).send({ themess });
});

module.exports = {
    GetThemes,
    CreateThemes,
    UpdateThemes,
    DeleteThemes,
    GetThemess,
};