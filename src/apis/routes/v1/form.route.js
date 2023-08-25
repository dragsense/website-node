const express = require('express')

const { formController } = require('../../controllers');
const { sharedValidation, formValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(formValidation.formSchema), formController.CreateForm);
router.get('/', formController.GetForms);

router.get('/elements/:id', formController.GetElements);
router.get('/style/:id', formController.GetStyle);
router.get('/css/:id', formController.GetCss);

router.post('/duplicate/:id', validate(sharedValidation.sharedSchema), formController.DuplicateForm);
router.get('/:id',  formController.GetForm);
router.put('/:id', validate(formValidation.formSchema), formController.UpdateForm);
router.post('/elements/:id', validate(formValidation.elementsSchema), formController.UpdateElements);
router.post('/style/:id', validate(formValidation.styleSchema), formController.UpdateStyle);
router.post('/submit/:id', formController.Submit);

router.delete('/:id', formController.DeleteForm);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: form management and retrieval
 */