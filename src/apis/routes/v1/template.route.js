const express = require('express')

const { templateController } = require('../../controllers');
const { templateValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/template', validate(templateValidation.templateSchema), templateController.CreateTemplate);
router.get('/templates', templateController.GetTemplates);
router.get('/template/:id',  templateController.GetTemplate);
router.put('/template/:id', validate(templateValidation.templateSchema), templateController.UpdateTemplate);
router.delete('/template/:id', templateController.DeleteTemplate);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: template management and retrieval
 */