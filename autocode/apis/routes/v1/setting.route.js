const express = require('express')

const { settingController } = require('../../controllers');
const { settingValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.get('/', settingController.GetSettings)
router.post('/', validate(settingValidation.settingSchema), settingController.SaveSetting)

module.exports =  {
    settingsRoute: router,
    GetPageData: settingController.GetPageData,
    GetCollectionData: settingController.GetCollectionData

}
