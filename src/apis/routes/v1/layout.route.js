const express = require('express')

const { layoutController } = require('../../controllers');
const { layoutValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(layoutValidation.layoutSchema), layoutController.CreateLayout);
router.get('/', layoutController.GetLayouts);
router.get('/:id',  layoutController.GetLayout);
router.put('/:id', validate(layoutValidation.layoutSchema), layoutController.UpdateLayout);
router.delete('/:id', layoutController.DeleteLayout);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Layouts
 *   description: layout management and retrieval
 */