import { fetcher } from '../../utils/fetch';



const PageServices = {

    get: function (id, type, origin) {
        return fetcher(`/api/v1/${type}s/data/${id}`, {
            method: 'Get',
            headers: {
                'Origin': origin,
              },
        });
    }

}

export default PageServices;