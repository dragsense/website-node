const express = require('express')

const { pageController } = require('../../controllers');
const { sharedValidation, pageValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(pageValidation.pageSchema), pageController.CreatePage);
router.get('/', pageController.GetPages);
router.post('/duplicate/:id', validate(sharedValidation.sharedSchema), pageController.DuplicatePage);

router.get('/:id',  pageController.GetPage);

router.get('/elements/:id', pageController.GetElements);
router.get('/style/:id', pageController.GetStyle);
router.get('/css/:id', pageController.GetCss);


router.put('/:id', validate(pageValidation.pageSchema),  pageController.UpdatePage);
router.post('/elements/:id', validate(pageValidation.elementsSchema), pageController.UpdateElements);
router.post('/style/:id', validate(pageValidation.styleSchema), pageController.UpdateStyle);


router.delete('/:id', pageController.DeletePage);

module.exports = {
    pageRoute: router,
    GetPageData: pageController.GetPageData
}

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: page management and retrieval
 */
