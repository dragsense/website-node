import { fetcher } from '../../utils/fetch';


// Helper function to sanitize URL
const sanitizeUrl = (url) => url.replace(/([^:]\/)\/+/g, '$1');

// Helper function to fetch data
const fetchData = async (url, method, body) => {
    try {
        const response = await fetcher(url, {
            method: method,
            body
        });
        return response;
    } catch (error) {
        console.error(`Error in fetchData: ${error}`);
    }
};

const FormServices = {

    submit: async function (formId, formStates) {
        const url =  `/api/v1/forms/submit/${formId}`;
        const sanitizedUrl = sanitizeUrl(url);
        return fetchData(sanitizedUrl, 'POST', formStates);
    },
}

export default FormServices;