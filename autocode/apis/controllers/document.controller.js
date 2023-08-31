const httpStatus = require('http-status')
const pickKeys = require('../../utils/pick-keys')

const catchAsync = require('../../utils/catch-async')
const { documentService } = require('../services')

const GetDocument = catchAsync(async (req, res) => {
    const document = await documentService.getDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.OK).send({ document });
});

const CreateDocument = catchAsync(async (req, res) => {
    const document = await documentService.createDocument(req.params.collectionId, req.query.form === 'true', req.body);
    res.status(httpStatus.CREATED).send({ document });
});

const DuplicateDocument = catchAsync(async (req, res) => {
    const document = await documentService.duplicateDocument(req.params.collectionId,  req.params.id, req.query.form === 'true');
    res.status(httpStatus.OK).send({ document });
});

const UpdateDocument = catchAsync(async (req, res) => {
    const document = await documentService.updateDocument(req.params.collectionId, req.params.id, req.query.form === 'true', req.body);
    res.status(httpStatus.OK).send({ document });
});

const DeleteDocument = catchAsync(async (req, res) => {
    await documentService.deleteDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.NO_CONTENT).send();
});

const GetDocuments = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const documents = await documentService.getDocuments(req.params.collectionId, req.query.form === 'true', filter, options);
    res.status(httpStatus.OK).send({documents});
});

const GetAllFilteredDocuments = catchAsync(async (req, res) => {
    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const results = await documentService.getAllFilteredDocuments(req.params.collectionId, req.body, filter, options);
    res.status(httpStatus.OK).send(results);
});

const GetFilteredDocuments = catchAsync(async (req, res) => {
  
    const documents = await documentService.getFilteredDocuments(req.params.collectionId, req.body);
    res.status(httpStatus.OK).send({ documents });
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