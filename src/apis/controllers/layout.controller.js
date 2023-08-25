const httpStatus = require('http-status')

const catchAsync = require('../../utils/catch-async')
const pickKeys = require('../../utils/pick-keys')


const { layoutService } = require('../services')

const GetLayout = catchAsync(async (req, res) => {
    const layout = await layoutService.getLayout(req.params.id);
    res.status(httpStatus.OK).send({ layout });
});

const CreateLayout = catchAsync(async (req, res) => {
    const layout = await layoutService.createLayout(req.body);
    res.status(httpStatus.CREATED).send({ layout });
});

const UpdateLayout = catchAsync(async (req, res) => {
    const layout = await layoutService.updateLayout(req.params.id, req.body);
    res.status(httpStatus.OK).send({ layout });
});

const DeleteLayout = catchAsync(async (req, res) => {
    await layoutService.deleteLayout(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetLayouts = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const layouts = await layoutService.getLayouts(filter, options);
    res.status(httpStatus.OK).send({ layouts });

});

module.exports = {
    GetLayout,
    CreateLayout,
    UpdateLayout,
    DeleteLayout,
    GetLayouts,
};