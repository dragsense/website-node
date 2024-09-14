const express = require('express')

const userRoute = require('./v1/user.route')
const { settingsRoute, GetPageData, GetCollectionData } = require('./v1/setting.route')
const themeRoute = require('./v1/theme.route')
const ecommerceRoute = require('./v1/ecommerce.route')
const pageRoute = require('./v1/page.route')
const collectionRoute = require('./v1/collection.route')
const themesRoute = require('./v1/themes.route')
const backupRoute = require('./v1/backup.route')
const uploadFile = require('../../middlewares/file-upload');
const { formRoute, formSubmit } = require('./v1/form.route')
const componentRoute = require('./v1/component.route')
const layoutRoute = require('./v1/layout.route')
const {
    dcoumentRoute,
    validateDocs,
    validateAllDocs,
    GetFilteredDocuments,
    GetAllFilteredDocuments } = require('./v1/document.route')
const templateRoute = require('./v1/template.route')
const mediaRoute = require('./v1/media.route')

const autocodeAPIAuth = require('../../middlewares/autocode-api-auth')


const router = express.Router()

const defaultRoutes = [

    {
        path: '/v1/users',
        route: userRoute,
    },
    {
        path: '/v1/settings',
        route: settingsRoute,
    },
    {
        path: '/v1/theme',
        route: themeRoute,
    },

    {
        path: '/v1/ecommerce',
        route: ecommerceRoute,
    },
    {
        path: '/v1/pages',
        route: pageRoute,
    },
    {
        path: '/v1/themes',
        route: themesRoute,
    },
    {
        path: '/v1/backup',
        route: backupRoute,
    },
    {
        path: '/v1/collections',
        route: collectionRoute,
    },
    {
        path: '/v1/documents',
        route: dcoumentRoute,
    },
    {
        path: '/v1/components',
        route: componentRoute,
    },
    {
        path: '/v1/forms',
        route: formRoute,
    },
    {
        path: '/v1/media',
        route: mediaRoute,
    },
    {
        path: '/v1/layouts',
        route: layoutRoute,
    },
    {
        path: '/v1/template',
        route: templateRoute,
    },
]



router.get("/v1", autocodeAPIAuth, (req, res) => {
    return res.status(200).json({ status: true });

})


router.get("/v1/pages/data/:id", GetPageData)
router.get("/v1/collections/data/:id", GetCollectionData)

const setPublicStatus = (req, res, next) => {
    req.query.status = 'PUBLIC';
    next();
}

router.post("/v1/collection/:collectionId/document",
    validateDocs,
    setPublicStatus, GetFilteredDocuments)
router.put('/v1/collection/:collectionId/document',
    validateAllDocs,
    setPublicStatus, GetAllFilteredDocuments)


router.post("/v1/forms/submit/:id", uploadFile.array('files[]', 10), formSubmit);


defaultRoutes.forEach((route) => {
    router.use(route.path, autocodeAPIAuth, route.route)
})



module.exports = router
