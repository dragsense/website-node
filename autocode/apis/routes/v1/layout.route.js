const express = require('express')

const { layoutController } = require('../../controllers');
const { layoutValidation, sharedValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(layoutValidation.layoutSchema), layoutController.CreateLayout);
router.get('/', layoutController.GetLayouts);
router.post('/duplicate/:id', validate(sharedValidation.sharedSchema), layoutController.DuplicateLayout);

router.get('/:id',  layoutController.GetLayout);


router.get('/elements/:id', layoutController.GetElements);
router.get('/style/:id', layoutController.GetStyle);
router.get('/css/:id', layoutController.GetCss);


router.put('/:id', validate(layoutValidation.layoutSchema), layoutController.UpdateLayout);
router.post('/elements/:id', validate(layoutValidation.elementsSchema), layoutController.UpdateElements);
router.post('/publish/:id', layoutController.PublishLayout);
router.post('/restore/:id', layoutController.PublishLayout);

router.post('/styles/:id', validate(layoutValidation.styleSchema), layoutController.UpdateStyle);
router.delete('/:id', layoutController.DeleteLayout);

module.exports = router
