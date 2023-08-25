const express = require('express')

const { mediaController } = require('../../controllers');
const { mediaValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');
const uploadFile = require('../../../middlewares/file-upload');


const router = express.Router()


router.post('/', uploadFile.single('file'), mediaController.CreateMedia);
router.get('/',  mediaController.GetMedia);
router.put('/:id', validate(mediaValidation.mediaSchema), mediaController.UpdateMedia);
router.delete('/:id', mediaController.DeleteMedia);

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: media management and retrieval
 */