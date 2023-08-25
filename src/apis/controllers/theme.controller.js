const httpStatus = require('http-status')

const catchAsync = require('../../utils/catch-async')
const { themeService } = require('../services')
const pickKeys = require('../../utils/pick-keys')
const { Readable } = require('stream');


const CreateColor = catchAsync(async (req, res) => {
    const color = await themeService.createColor(req.body)
    res.status(httpStatus.CREATED).send({ color })
})


const UpdateColor = catchAsync(async (req, res) => {
    const color = await themeService.updateColor(req.params._uid, req.body)
    res.status(httpStatus.OK).send({ color })
})


const DeleteColor = catchAsync(async (req, res) => {
    const _uid = await themeService.deleteColor(req.params._uid)
    res.status(httpStatus.OK).send({ _uid })
})


const GetColors = catchAsync(async (req, res) => {

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);

    const colors = await themeService.getColors(filter, options)
    res.status(httpStatus.OK).send({ colors })
})


const CreateFont = catchAsync(async (req, res) => {
    const font = await themeService.createFont(req.body)
    res.status(httpStatus.CREATED).send({ font })
})


const UpdateFont = catchAsync(async (req, res) => {
    const font = await themeService.updateFont(req.params._uid, req.body)
    res.status(httpStatus.OK).send({ font })
})


const DeleteFont = catchAsync(async (req, res) => {
    const _uid = await themeService.deleteFont(req.params._uid)
    res.status(httpStatus.OK).send({ _uid })
})


const GetFonts = catchAsync(async (req, res) => {

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);

    const fonts = await themeService.getFonts(filter, options)
    res.status(httpStatus.OK).send({ fonts })
})


const CreateIcon = catchAsync(async (req, res) => {
    const icon = await themeService.createIcon(req.body)
    res.status(httpStatus.CREATED).send({ icon })
})


const UpdateIcon = catchAsync(async (req, res) => {
    const icon = await themeService.updateIcon(req.params._uid, req.body)
    res.status(httpStatus.OK).send({ icon })
})


const DeleteIcon = catchAsync(async (req, res) => {
    const _uid = await themeService.deleteIcon(req.params._uid)
    res.status(httpStatus.OK).send({ _uid })
})


const GetIcons = catchAsync(async (req, res) => {

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);

    const icons = await themeService.getIcons(filter, options)
    res.status(httpStatus.OK).send({ icons })
})


const CreateVariable = catchAsync(async (req, res) => {
    const variable = await themeService.createVariable(req.body)
    res.status(httpStatus.CREATED).send({ variable })
})


const UpdateVariable = catchAsync(async (req, res) => {
    const variable = await themeService.updateVariable(req.params._uid, req.body)
    res.status(httpStatus.OK).send({ variable })
})


const DeleteVariable = catchAsync(async (req, res) => {
    const _uid = await themeService.deleteVariable(req.params._uid)
    res.status(httpStatus.OK).send({ _uid })
})


const GetVariables = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);

    const variables = await themeService.getVariables(filter, options)
    res.status(httpStatus.OK).send({ variables })
})


const SaveStyle = catchAsync(async (req, res) => {
    const result = await themeService.saveStyle(req.body)
    res.status(httpStatus.CREATED).json(result)
})


const GetStyle = catchAsync(async (req, res) => {

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    const result = await themeService.getStyle(req.params._id, stream)

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
})


const GetAnimations = catchAsync(async (req, res) => {

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    const result = await themeService.getAnimations(req.params._id, stream)

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'application/json');
    stream.pipe(res);
})


const GetAnimationsNames = catchAsync(async (req, res) => {
    const names = await themeService.getAnimationsNames()
    res.status(httpStatus.OK).json({ names })
})

const SaveAnimations = catchAsync(async (req, res) => {
    const result = await themeService.saveAnimations(req.body)
    res.status(httpStatus.CREATED).json(result)
})

const GetAnimationsCss = catchAsync(async (req, res) => {

    const result = await themeService.getAnimationsCss()
    res.status(httpStatus.OK).json(result)
})

const SaveCss = catchAsync(async (req, res) => {
    const result = await themeService.saveCss(req.body)
    res.status(httpStatus.CREATED).json(result)
})


const GetCss = catchAsync(async (req, res) => {
    const result = await themeService.getCss()
    res.status(httpStatus.OK).json(result)
})


const GetCustomCss = catchAsync(async (req, res) => {
    const result = await themeService.getCsutomCss()
    res.status(httpStatus.OK).json(result)
})

const SaveJs = catchAsync(async (req, res) => {
    const result = await themeService.saveJs(req.body)
    res.status(httpStatus.CREATED).json(result)
})


const GetJs = catchAsync(async (req, res) => {
    const result = await themeService.getJs()
    res.status(httpStatus.OK).json(result)
})







module.exports = {
    GetColors,
    DeleteColor,
    UpdateColor,
    CreateColor,
    GetFonts,
    DeleteFont,
    UpdateFont,
    GetCustomCss,
    CreateFont,
    GetVariables,
    DeleteVariable,
    UpdateVariable,
    CreateVariable,
    GetIcons,
    DeleteIcon,
    UpdateIcon,
    CreateIcon,
    GetStyle,
    SaveStyle,
    SaveAnimations,
    GetAnimations,
    GetAnimationsNames,
    GetAnimationsCss,
    GetJs,
    SaveJs,
    SaveCss,
    GetCss
}
