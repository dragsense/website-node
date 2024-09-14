const express = require('express')

const { themesController } = require('../../controllers');
const { themesValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(themesValidation.themesSchema), themesController.InstallTheme);

module.exports = router
