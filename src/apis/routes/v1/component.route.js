const express = require('express')

const { componentController } = require('../../controllers');
const { sharedValidation, componentValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(componentValidation.componentSchema), componentController.CreateComponent);
router.get('/', componentController.GetComponents);
router.get('/custom/paths', componentController.GetPaths);

router.get('/elements/:id', componentController.GetElements);
router.get('/style/:id', componentController.GetStyle);
router.get('/css/:id', componentController.GetCss);


router.post('/duplicate/:id', validate(sharedValidation.sharedSchema), componentController.DuplicateComponent);
router.get('/:id',  componentController.GetComponent);
router.post('/elements/:id', validate(componentValidation.elementsSchema), componentController.UpdateComponent);
router.post('/style/:id', validate(componentValidation.styleSchema), componentController.UpdateStyle);

router.put('/:id', validate(componentValidation.componentSchema), componentController.UpdateComponent);
router.delete('/:id', componentController.DeleteComponent);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Components
 *   description: component management and retrieval
 */