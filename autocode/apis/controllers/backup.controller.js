const httpStatus = require('http-status')
var fs = require('fs');
const { getCurrentDate } = require('../../utils/utils');

const catchAsync = require('../../utils/catch-async')
const { backupService } = require('../services')

const GetBackup = catchAsync(async (req, res) => {
    const folderPath = await backupService.getBackup(req.params.id);

    const readStream =  fs.createReadStream(folderPath);

    var stat = fs.statSync(folderPath);

    res.setHeader('Content-Length', stat.size );
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${req.params.id}-${getCurrentDate()}.zip`);


    readStream.pipe(res);
});

const CreateBackup = catchAsync(async (req, res) => {
    const backup = await backupService.createBackup(req.body);
    res.status(httpStatus.CREATED).send({ backup });
});

const UpdateBackup = catchAsync(async (req, res) => {
    const backup = await backupService.updateBackup(req.params.id, req.body);
    res.status(httpStatus.OK).send({ backup });
});

const DeleteBackup = catchAsync(async (req, res) => {
    await backupService.deleteBackup(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const InstallBackup = catchAsync(async (req, res) => {
    const backup = await backupService.installBackup(req.params.id);
    res.status(httpStatus.OK).send({ backup });
});

module.exports = {
    GetBackup,
    CreateBackup,
    UpdateBackup,
    DeleteBackup,
    InstallBackup,
};