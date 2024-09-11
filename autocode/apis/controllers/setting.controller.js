const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const { loadService } = require('../../loaders/servicesLoader')



const SaveSetting = catchAsync(async (req, res) => {
    const settingService = loadService('settingService')
    const setting = await settingService.saveSetting(req.body);
    res.status(httpStatus.CREATED).send({ setting });
});

const GetSettings = catchAsync(async (req, res) => {
    const settingService = loadService('settingService')
    const settings = await settingService.getSettings();
    const protocol = 'https';
    const host = `${protocol}://${req.headers.host}`;
    res.status(httpStatus.OK).send({ settings, host });
});

const GetPageData = catchAsync(async (req, res) => {
    const settingService = loadService('settingService')
    const protocol = 'https';
    const host = `${protocol}://${req.headers.host}`;
    const results = await settingService.getPageData(req.params.id, 'page', host);
    res.status(httpStatus.OK).send(results);
});

const GetCollectionData = catchAsync(async (req, res) => {
    const settingService = loadService('settingService')
    const protocol = 'https';
    const host = `${protocol}://${req.headers.host}`;
    const remainingSlug = req.query.remainingSlug;
    const results = await settingService.getPageData(req.params.id, 'collection', host, false, remainingSlug);
    res.status(httpStatus.OK).send(results);
});

const Download = catchAsync(async (req, res) => {
    const settingService = loadService('settingService')
    const protocol = 'https';
    const host = `${protocol}://${req.headers.host}`;
    const { AutoCode, AutocodeCustom } = req.query;
    await settingService.download(req.query, res, host, AutoCode, AutocodeCustom);
});

module.exports = {
    SaveSetting,
    GetSettings,
    GetPageData,
    GetCollectionData,
    Download
};
