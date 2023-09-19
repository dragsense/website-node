const httpStatus = require('http-status')


const catchAsync = require('../../utils/catch-async')
const { settingService } = require('../services')

const SaveSetting = catchAsync(async (req, res) => {
    const setting = await settingService.saveSetting(req.body)
    res.status(httpStatus.CREATED).send({ setting })
})


const GetSettings = catchAsync(async (req, res) => {
    const setting = await settingService.getSettings()
    res.status(httpStatus.OK).send({ setting })
})


const GetPageData = catchAsync(async (req, res) => {
    const setting = await settingService.GetPageData(req.params.id, 'page')
    res.status(httpStatus.OK).send({ setting })
})

const GetCollectionData = catchAsync(async (req, res) => {
    const setting = await settingService.GetPageData(req.params.id, 'collection')
    res.status(httpStatus.OK).send({ setting })
})


const Download = catchAsync(async (req, res, AutoCode, AutocodeCustom) => {
    settingService.download(req.query, res, AutoCode, AutocodeCustom);
})




module.exports = {
    SaveSetting,
    GetSettings,
    Download,
    GetPageData,
    GetCollectionData
}
