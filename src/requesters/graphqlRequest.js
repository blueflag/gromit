//@flow

import Gromit from '../Gromit';


const graphqlRequest = (url: string, getToken: () => Promise<string>) => async (query: string, variables: Object): Promise<Object> => {
    const token = await getToken();
    return Gromit({headers: {
        'Authorization': token
    }})
        .post(url, {query, variables})
        .then(response => response.data);
};


export default graphqlRequest;