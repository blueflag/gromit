//@flow

import Gromit from '../Gromit';

/**
 * Executes a graphql request
 * @callback GraphqlRequester
 * @param {string} query - The graphql query string
 * @param {Object} variables - variables to add to the query
 * @return {Promise<Object>} a promise that resolves to the Graphql response data
 *
 */


/**
 * Fetch an authorization token
 * @callback TokenGetter
 * @return {Promise<string>} The token future
 */



/**
 *
 * Make a grapqhl request.
 * @function graphqlRequest
 * @param {string} url - The url to request
 * @param {TokenGetter} getToken - A function returning a promise that will resolve to a new token that will be placed in the Authorization header
 * @return {GraphqlRequester} - A function that accepts a query string and variables object
 *
 */
export default (url: string, getToken: () => Promise<string>) => async (query: string, variables: Object): Promise<Object> => {
    const token = await getToken();
    return Gromit({headers: {
        'Authorization': token
    }})
        .post(url, {query, variables})
        .then(response => response.data);
};


