const express = require('express')

const { collectionController } = require('../../controllers');
const { sharedValidation, collectionValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(collectionValidation.collectionSchema), collectionController.CreateCollection);
router.get('/', collectionController.GetCollections);


router.get('/elements/:id', collectionController.GetElements);
router.get('/style/:id', collectionController.GetStyle);
router.get('/css/:id', collectionController.GetCss);

router.post('/duplicate/:id', validate(sharedValidation.sharedSchema), collectionController.DuplicateCollection);

router.get('/:id',  collectionController.GetCollection);
router.put('/:id', validate(collectionValidation.collectionSchema), collectionController.UpdateCollection);
router.post('/elements/:id', validate(collectionValidation.elementsSchema), collectionController.UpdateElements);
router.post('/style/:id', validate(collectionValidation.styleSchema), collectionController.UpdateStyle);

router.delete('/:id', collectionController.DeleteCollection);

module.exports = {
    collectionRoute: router,
    GetCollectionData: collectionController.GetPageData
}

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: collection management and retrieval
 */