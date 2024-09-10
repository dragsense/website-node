import { fetcher } from '../../utils/fetch';

// Helper function to sanitize URL
const sanitizeUrl = (url) => url.replace(/([^:]\/)\/+/g, '$1');

// Helper function to fetch data
const fetchData = async (url, method, states) => {
    try {
        const response = await fetcher(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...states})
        });
        return response;
    } catch (error) {
        console.error(`Error in fetchData: ${error}`);
    }
};



const DocumentServices = {

    // Fetch all documents with filters applied
    getAllFilteredDocuments: async function (collectionId, states, page = 1, limit=25, sortBy = 'createdAt', sort="acs") {
        const url =  `${AUTOCODE_API_PREFIX}/v1/collection/${collectionId}/document?limit=${limit}&page=${page}&sortBy=${sortBy+":"+sort}`;
        const sanitizedUrl = sanitizeUrl(url);
        return fetchData(sanitizedUrl, 'PUT', states);
    },

    // Fetch documents based on collectionId and states
    getFilteredDocuments: async function (collectionId, states) {
        const url = `${AUTOCODE_API_PREFIX}/v1/collection/${collectionId}/document`;
        const sanitizedUrl = sanitizeUrl(url);
        return fetchData(sanitizedUrl, 'POST', states);
    },
}

export default DocumentServices;