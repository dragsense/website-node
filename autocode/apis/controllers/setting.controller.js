const httpStatus = require('http-status')


const catchAsync = require('../../utils/catch-async')
const { settingService } = require('../services')

const SaveSetting = catchAsync(async (req, res) => {
    const setting = await settingService.saveSetting(req.body)
    res.status(httpStatus.CREATED).send({ setting })
})


const GetSettings = catchAsync(async (req, res) => {
    const setting = await settingService.getSettings();

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;


    res.status(httpStatus.OK).send({ setting,host })
})


const GetPageData = catchAsync(async (req, res) => {
    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;
    const results = await settingService.getPageData(req.params.id, 'page', host)
    res.status(httpStatus.OK).send(results)
})

const GetCollectionData = catchAsync(async (req, res) => {
    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;
    const results = await settingService.getPageData(req.params.id, 'collection', host)
    res.status(httpStatus.OK).send(results)
})


const Download = catchAsync(async (req, res, AutoCode, AutocodeCustom) => {

    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    settingService.download(req.query, res, host,  AutoCode, AutocodeCustom);
})




module.exports = {
    SaveSetting,
    GetSettings,
    Download,
    GetPageData,
    GetCollectionData
}
