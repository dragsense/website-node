const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const { loadService } = require('../../loaders/servicesLoader')

var fs = require('fs')
var fs_Extra = require('fs-extra')

const InstallTheme = catchAsync(async (req, res) => {
    const themesService = loadService('themesService');
    const backupService = loadService('backupService');
  
    const destinationDir = await themesService.installTheme(req.body);
    const theme = await backupService.installBackup('', destinationDir);

    if (fs.existsSync(destinationDir + '.zip')) {
        fs.rmSync(destinationDir + '.zip', { recursive: true })
    }
    
    res.status(httpStatus.OK).send({ theme })
});


module.exports = {
    InstallTheme
};
