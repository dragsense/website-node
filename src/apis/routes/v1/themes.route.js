const express = require('express')

const { themesController } = require('../../controllers');
const { themesValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/themes', validate(themesValidation.themesSchema), themesController.CreateThemes);
router.get('/themess', themesController.GetThemess);
router.get('/themes/:id',  themesController.GetThemes);
router.put('/themes/:id', validate(themesValidation.themesSchema), themesController.UpdateThemes);
router.delete('/themes/:id', themesController.DeleteThemes);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Themess
 *   description: themes management and retrieval
 */