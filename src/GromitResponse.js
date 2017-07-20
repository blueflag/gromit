//@flow


/**
 *
 * @module GromitResponse
 *
 */

import {Gromit} from './Gromit';

export type GromitResponseResponseData = {
    statusCode: number,
    statusText: string,
    data: any,
    headers: Object,
    request: XMLHttpRequest | http$ClientRequest
};


/**
 *
 * Gromit Response Object
 *
 */
export default class GromitResponse {
    requester: Gromit;
    statusCode: number;
    statusText: string;
    data: any;
    headers: Object;
    request: XMLHttpRequest | http$ClientRequest;

    /**
     *
     * Create a new Gromit resposne
     * @param {Object} responseData - Response data to build the response from
     * @param {ClientRequest|XMLHttpRequest} responseData.request - The request that created this response. Will be a `XMLHttpRequest` in the browser and `ClientRequest` in node.js
     * @param {any} responseData.data - The response data in whatever format the surver supplied it
     * @param {Object} headers - The response headers returned by the server
     * @param {number} statusCode - The status code returned by the server
     * @param {string} statusText - The status text returned by the server
     * @param {Gromit} [requester] - The instance Gromit that made the request (if applicable)
     */
    constructor(
        responseData: GromitResponseResponseData,
        requester: ?Gromit
    ) {
        /**
         * The instance Gromit that made the request (if applicable)
         * @type {Gromit}
         */
        this.requester = requester;
        /**
         * The request that created this response. Will be a `XMLHttpRequest` in the browser and `ClientRequest` in node.js
         * @type {ClientRequest|XMLHttpRequest}
         */
        this.request = responseData.request;
        /**
         * The response data in whatever format the surver supplied it
         * @type {any}
         */
        this.data = responseData.data;
        /**
         * The response headers returned by the server
         * @type {Object}
         */
        this.headers = responseData.headers;
        /**
         * The status code returned by the server
         * @type {number}
         */
        this.statusCode = responseData.statusCode;
        /**
         * The status text returned by the server
         * @type {string}
         */
        this.statusText = responseData.statusText;
    }

    static fromAxiosResponse(response: Object, requester: Gromit): GromitResponse {
        return new GromitResponse({
            request: response.request,
            data: response.data,
            headers: response.headers,
            statusCode: response.status,
            statusText: response.statusText
        }, requester);
    }
}
