const express = require('express')

const { themeController } = require('../../controllers')

const { themeValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');

const router = express.Router()

router.get('/colors', themeController.GetColors)
router.post('/color', validate(themeValidation.colorSchema), themeController.CreateColor)
router.put('/color/:_uid', validate(themeValidation.colorSchema), themeController.UpdateColor)
router.delete('/color/:_uid', themeController.DeleteColor)


router.get('/fonts', themeController.GetFonts)
router.post('/font', validate(themeValidation.fontSchema), themeController.CreateFont)
router.put('/font/:_uid', validate(themeValidation.fontSchema), themeController.UpdateFont)
router.delete('/font/:_uid', themeController.DeleteFont)

router.get('/icons', themeController.GetIcons)
router.post('/icon', validate(themeValidation.iconSchema), themeController.CreateIcon)
router.put('/icon/:_uid', validate(themeValidation.iconSchema), themeController.UpdateIcon)
router.delete('/icon/:_uid', themeController.DeleteIcon)

router.get('/variables', themeController.GetVariables)
router.post('/variable', validate(themeValidation.variableSchema), themeController.CreateVariable)
router.put('/variable/:_uid', validate(themeValidation.variableSchema), themeController.UpdateVariable)
router.delete('/variable/:_uid', themeController.DeleteVariable)


router.get('/style/:_id', themeController.GetStyle);
router.post('/style/:_id', validate(themeValidation.styleSchema),  themeController.SaveStyle)

router.get('/animation/:_id', themeController.GetAnimations);
router.post('/animation/:_id', validate(themeValidation.animationSchema),  themeController.SaveAnimations)

router.get('/css/animation/names', themeController.GetAnimationsNames);

router.get('/css/animation', themeController.GetAnimationsCss);
router.get('/css', themeController.GetCss);
router.get('/customCss', themeController.GetCustomCss);

router.post('/css', validate(themeValidation.codeSchema),  themeController.SaveCss)

router.get('/js', themeController.GetJs)
router.post('/js', validate(themeValidation.codeSchema),  themeController.SaveJs)

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Theme
 *   description: theme management and retrieval
 */
