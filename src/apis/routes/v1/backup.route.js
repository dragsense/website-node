const express = require('express')

const { backupController } = require('../../controllers');
const { backupValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


const router = express.Router()

router.post('/', validate(backupValidation.backupSchema), backupController.CreateBackup);
router.get('/:id',  backupController.GetBackup);
router.put('/:id', backupController.UpdateBackup);
router.delete('/:id', backupController.DeleteBackup);
router.put('/install/:id', backupController.InstallBackup);


module.exports = router

/**
 * @swagger
 * tags:
 *   name: Backups
 *   description: backup management and retrieval
 */