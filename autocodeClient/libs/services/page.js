import { fetcher } from '../../utils/fetch';



// Helper function to build the URL
const buildUrl = (type, id) => `${AUTOCODE_API_PREFIX}/v1/${type}s/data/${id}`;

// Helper function to build the fetch options
const buildFetchOptions = (origin) => ({
    method: 'GET',
    headers: {
        'Origin': origin,
    },
});

const PageServices = {

    // Fetches data based on the provided id, type and origin
    get: async function (id, type, remainingSlug, origin) {
        try {
            const url = buildUrl(type, id);
            const options = buildFetchOptions(origin);
            const response = await fetcher(`${url}?remainingSlug=${remainingSlug}`, options);
            return response;
        } catch (error) {
            console.error(`Error in fetchData: ${error}`);
            throw error;
        }
    }

}

export default PageServices;