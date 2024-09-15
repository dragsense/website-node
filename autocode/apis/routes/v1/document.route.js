const express = require('express')

const { documentController } = require('../../controllers');
const { sharedValidation, documentValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/:collectionId', validate(documentValidation.documentSchema), documentController.CreateDocument);
router.post('/:collectionId/duplicate/:id', validate(sharedValidation.sharedSchema), documentController.DuplicateDocument);
router.get('/:collectionId', documentController.GetDocuments);
router.get('/:collectionId/:id',  documentController.GetDocument);
router.put('/:collectionId/:id', validate(documentValidation.documentSchema), documentController.UpdateDocument);
router.delete('/:collectionId/:id', documentController.DeleteDocument);

router.post('/:collectionId/get/filtered', validate(documentValidation.filterDocSchema), documentController.GetFilteredDocuments);
router.put('/:collectionId/get/filtered',validate(documentValidation.filterSchema), documentController.GetAllFilteredDocuments);
router.get('/:collectionId/get/download', documentController.DownloadDocuments);


module.exports = router

module.exports = {
    dcoumentRoute: router,
    validateDocs:  validate(documentValidation.filterDocSchema),
    validateAllDocs: validate(documentValidation.filterSchema),
    GetFilteredDocuments: documentController.GetFilteredDocuments,
    GetAllFilteredDocuments: documentController.GetAllFilteredDocuments
}

