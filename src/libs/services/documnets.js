import { fetcher } from '../../utils/fetch';


const DocumentServices = {


    getAllFilteredDocuments: async function (collectionId, states, page = 1, limit=25, sortBy = 'createdAt', sort="acs") {

    
        const url =  `/api/v1/documents/collection/${collectionId}/document?limit=${limit}&page=${page}&sortBy=${sortBy+":"+sort}`;
        const sanitizedUrl = url.replace(/([^:]\/)\/+/g, '$1');

        return fetcher(`${sanitizedUrl}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...states})
        });
    },

    
    getFilteredDocuments: async function (collectionId, states) {

    
        const url = `/api/v1/documents/collection/${collectionId}/document`;
        const sanitizedUrl = url.replace(/([^:]\/)\/+/g, '$1');

        return fetcher(`${sanitizedUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({...states})
        });
    },
}

export default DocumentServices;