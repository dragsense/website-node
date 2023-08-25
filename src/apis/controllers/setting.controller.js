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


const Download = catchAsync(async (req, res) => {
    
    settingService.download(req.query, res);

 
})




module.exports = {
    SaveSetting,
    GetSettings,
    Download
}
