const httpStatus = require('http-status');
const pickKeys = require('../../utils/pick-keys');
const catchAsync = require('../../utils/catch-async');
const ApiError = require('../../utils/api-error'); // Make sure this utility is available
const { loadService } = require('../../loaders/servicesLoader')
const fs = require('fs');
const path = require('path')
const env = require('../../configs/env')


const GetDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    
    const document = await documentService.getDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
 
    const host = `${env.protocol}://${req.headers.host}`;

    res.status(httpStatus.OK).send({ document, host });
});

const CreateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    

    const document = await documentService.createDocument(req.params.collectionId, req.query.form === 'true', req.body);

    res.status(httpStatus.CREATED).send({ document });
});

const DuplicateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');


    const document = await documentService.duplicateDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.OK).send({ document });
});

const UpdateDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');


    const document = await documentService.updateDocument(req.params.collectionId, req.params.id, req.query.form === 'true', req.body);
    res.status(httpStatus.OK).send({ document });
});

const DeleteDocument = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    

    await documentService.deleteDocument(req.params.collectionId, req.params.id, req.query.form === 'true');
    res.status(httpStatus.NO_CONTENT).send();
});

const GetDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');


    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);
    const documents = await documentService.getDocuments(req.params.collectionId, req.query.form === 'true', filter, options);
    res.status(httpStatus.OK).send({ documents });
});


/**
 * Controller for downloading documents in CSV format
 */
const DownloadDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    const { collectionId } = req.params;
    const isForm = req.query.form === 'true'; // Check if it's a form or collection
    const filter = pickKeys(req.query, ['name', 'startDate', 'endDate', 'status']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page']);

    const host = `${env.protocol}://${req.headers.host}`;

    // Call the downloadDocuments service
    const outputPath = await documentService.downloadDocuments(collectionId, isForm, filter, options, host);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(outputPath)}`);

    console.log(outputPath)
    // Stream the CSV file to the client
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Delete the file after it is successfully streamed to the client
    fileStream.on('end', () => {
        fs.unlink(outputPath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
            else console.log('Temporary CSV file deleted');
        });
    });

    // Handle errors in file streaming
    fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Error downloading the file');
    });
});


const GetAllFilteredDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    

    const filter = pickKeys(req.query, ['name']);
    const options = pickKeys(req.query, ['sortBy', 'limit', 'page', 'status']);
    const results = await documentService.getAllFilteredDocuments(req.params.collectionId, req.body, filter, options);
    res.status(httpStatus.OK).send(results);
});

const GetFilteredDocuments = catchAsync(async (req, res) => {
    const documentService = loadService('documentService');
    

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
    DownloadDocuments,
    GetAllFilteredDocuments,
    GetFilteredDocuments
};
