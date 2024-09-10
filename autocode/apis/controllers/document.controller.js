const httpStatus = require('http-status');
const pickKeys = require('../../utils/pick-keys');
const catchAsync = require('../../utils/catch-async');
const ApiError = require('../../utils/api-error'); // Make sure this utility is available
const { loadService } = require('../../loaders/servicesLoader')

const GetDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.getDocument) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getDocument not found in documentService');
    }

    const document = await documentService.getDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    const protocol = req.protocol || 'http';
    const host = `${protocol}://${req.headers.host}`;

    res.status(httpStatus.OK).send({ document, host });
});

const CreateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.createDocument) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createDocument not found in documentService');
    }

    const document = await documentService.createDocument(req.params.collectionId, req.query.form === 'true', req.body);
    res.status(httpStatus.CREATED).send({ document });
});

const DuplicateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.duplicateDocument) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method duplicateDocument not found in documentService');
    }

    const document = await documentService.duplicateDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.OK).send({ document });
});

const UpdateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.updateDocument) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateDocument not found in documentService');
    }

    const document = await documentService.updateDocument(req.params.collectionId, req.params.id, req.query.form === 'true', req.body);
    res.status(httpStatus.OK).send({ document });
});

const DeleteDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.deleteDocument) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteDocument not found in documentService');
    }

    await documentService.deleteDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.NO_CONTENT).send();
});

const GetDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.getDocuments) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getDocuments not found in documentService');
    }

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const documents = await documentService.getDocuments(req.params.collectionId, req.query.form === 'true', filter, options);
    res.status(httpStatus.OK).send({ documents });
});

const GetAllFilteredDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.getAllFilteredDocuments) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getAllFilteredDocuments not found in documentService');
    }

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page', 'status']);
    const results = await documentService.getAllFilteredDocuments(req.params.collectionId, req.body, filter, options);
    res.status(httpStatus.OK).send(results);
});

const GetFilteredDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    if (!documentService.getFilteredDocuments) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getFilteredDocuments not found in documentService');
    }

    const options = pickKeys(req.query, ['sortBy', 'limit', 'page', 'status']);
    const results = await documentService.getFilteredDocuments(req.params.collectionId, req.body, options);
    res.status(httpStatus.OK).send(results);
});

module.exports = {
    GetDocument,
    CreateDocument,
    UpdateDocument,
    DuplicateDocument,
    DeleteDocument,
    GetDocuments,
    GetAllFilteredDocuments,
    GetFilteredDocuments
};
