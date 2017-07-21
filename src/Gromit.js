// @flow
import axios from 'axios';
import GromitError from './GromitError';
import GromitResponse from './GromitResponse';

/**
 *
 * @module Gromit
 *
 */



/**
 * Data to send with a request. Only allowed for request methods that allow a body (`post`, `put`, `patch`)
 * @typedef GromitBodyData
 * @type {string | Object | ArrayBuffer | ArrayBufferView | URLSearchParams | FormData | File | Blob | Stream | Buffer}
 */
export type GromitBodyData = string | Object | ArrayBuffer | $ArrayBufferView | URLSearchParams | FormData | File | Blob | stream$Readable | Buffer;

/**
 * URL parameters to attach to a request URL
 * @typedef GromitParamData
 * @type {Object | URLSearchParams}
 */
export type GromitParamData = Object | URLSearchParams;

/**
 * HTTP method for a request
 * @typedef GromitMethod
 * @type {'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'}
 */
export type GromitMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Response type expected for a request
 * @typedef GromitResponseType
 * @type {'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'}
 */
export type GromitResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';

/**
 * The main configuration object that expresses a Gromit Request. All properties are optional.
 *
 * @typedef GromitConfiguration
 * @property {GromitMethod} [method] - The HTTP method to use for the request
 * @property {string} [path] - The path to request. This will be appended to `baseUrl`
 * @property {GromitBodyData} [data] - The data to send with the request. Will be ignored for bodyless requests.
 * @property {GromitParamData} [params] - The URL parameters to pass with the request
 * @property {Object} [headers] - An object of headers to pass with the request
 * @property {string} [baseUrl] - The base url of the request. `path` will be appended to this.
 * @property {number} [timeout] - The amount of milliseconds to wait before aborting the request
 * @property {boolean} [withCredentials=false] - whether cross-site Access-Control request should be made using credentials
 * @property {Object} [auth] - object containing `username` and `password` for HTTP basic auth
 * @property {GromitResponseType} [responseType=json] - Indicates the response type that the server will respond with
 * @property {number} [maxContentLength] - The maximum content length for the response in bytes
 * @property {number} [maxRedirects=5] - max number of redirects to follow (nodejs only)
 * @property {ProgressCallback} [onUploadProgress] - Callback for upload progress
 * @property {ProgressCallback} [onDownloadProgress] - Callback for download progress
 * @property {ResponseCallback} [beforeResponse] - Callback to be inserted into the promise chain before it is resolved
 *
 */

export type GromitConfiguration = {
    method?: GromitMethod,
    path?: string,
    data?: GromitBodyData,
    params?: GromitParamData,
    headers?: Object,
    baseUrl?: string,
    timeout?: number,
    withCredentials?: bool,
    auth?: {
        username: string,
        password: string
    },
    responseType?: GromitResponseType,
    maxContentLength?: number,
    maxRedirects?: number,
    onUploadProgress?: (progressEvent: ProgressEvent) => void,
    onDownloadProgress?: (progressEvent: ProgressEvent) => void,
    beforeResponse?: (response: GromitResponse) => any
};


const defaultConfig = {
    method: 'get'
};


/**
 *
 * The Gromit configurator is called with the current configuration and expected to return
 * a new `GromitConfiguration`
 *
 * @callback GromitConfigurator
 * @param {GromitConfiguration} configuration
 * @return {GromitConfiguration}
 *
 */


/**
 *
 * A progress callback is called either on upload or download progress.
 *
 * @callback ProgressCallback
 * @param {ProgressEvent} progressEvent - The [ProgressEvent](https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent) interface for this progress event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
 * @return {void}
 *
 *
 */

/**
 *
 * Callback to be inserted into the promise chain before it is resolved
 *
 * @callback ResponseCallback
 * @param {GromitResponse} response - The GromitResponse object or a promise resolving to a GromitResponse object
 * @return {GromitResponse | Promise<GromitResponse>}
 *
 *
 */



export class Gromit {
    configuration: GromitConfiguration;

    constructor(configuration: GromitConfiguration) {
        /**
         * The configuration for this instance of gromit. Do not update this directly, use the
         * `gromit.configure()` method.
         * @type GromitConfiguration
         */
        this.configuration = {
            ...defaultConfig,
            ...configuration
        };
    }

    unit(configuration: GromitConfiguration): Gromit {
        return new Gromit({
            ...this.configuration,
            configuration
        });
    }

    /**
     *
     * Returns a new Gromit instance with configuration applied by supplied configurator
     * @param {GromitConfigurator} configurator
     * @return {Gromit} - a new instance of Gromit
     *
     */
    configure(configurator: (GromitConfiguration) => GromitConfiguration): Gromit {
        return new Gromit(configurator(this.configuration));
    }


    /**
     * Monitor upload progress
     * @param {ProgressCallback} cb
     * @return {Gromit} - a new instance of Gromit
     */

    uploadProgress(cb: (progressEvent: ProgressEvent) => void): Gromit {
        return this.unit({
            onUploadProgress: cb
        });
    }

    /**
     * Monitor download progress
     * @param {ProgressCallback} cb
     * @return {Gromit} - a new instance of Gromit
     */
    downloadProgress(cb: (progressEvent: ProgressEvent) => void): Gromit {
        return this.unit({
            onDownloadProgress: cb
        });
    }


    /**
     * Request data
     * @param {GromitMethod} [method] - HTTP method to use for the request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitBodyData} [data] - body data to send with the request
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    request(
        method: ?GromitMethod,
        path: ?string,
        data: ?GromitBodyData,
        params: ?GromitParamData
    ): Promise<GromitResponse> {
        return this.unit({
            method: method || this.configuration.method,
            path: typeof path === 'string' ? path : this.configuration.path,
            data: data || this.configuration.data,
            params: params || this.configuration.params
        }).fetch();
    }


    /**
     * Get data
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    get(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('get', path, null, params);
    }

    /**
     * Post request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitBodyData} [data] - body data to send with the request
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    post(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('post', path, data, params);
    }

    /**
     * Put request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitBodyData} [data] - body data to send with the request
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    put(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('put', path, data, params);
    }

    /**
     * Patch request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitBodyData} [data] - body data to send with the request
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    patch(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('patch', path, data, params);
    }

    /**
     * Delete request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    delete(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('delete', path, null, params);
    }

    /**
     * Head request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    head(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('head', path, null, params);
    }


    /**
     * Options request
     * @param {string} [path] - the path to the requested resource relative to the `baseUrl`
     * @param {GromitParamData} [params] - URL parameters to add the the requested URL
     * @return {Promise<GromitResponse>}
     */
    options(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('options', path, null, params);
    }

    /**
     * Perform request using current configuration
     * @return {Promise<GromitResponse>}
     */
    fetch(): Promise<GromitResponse> {
        return axios({
            method: this.configuration.method,
            baseURL: this.configuration.baseUrl,
            url: this.configuration.path,
            params: this.configuration.params,
            data: this.configuration.data,
            headers: this.configuration.headers,
            timeout: this.configuration.timeout,
            withCredentials: this.configuration.withCredentials,
            auth: this.configuration.auth,
            responseType: this.configuration.responseType,
            maxContentLength: this.configuration.maxContentLength,
            maxRedirects: this.configuration.maxRedirects,
            onUploadProgress: this.configuration.onUploadProgress,
            onDownloadProgress: this.configuration.onDownloadProgress
        })
            .then(axiosResponse => GromitResponse.fromAxiosResponse(axiosResponse, this))
            .then(response => this.configuration.beforeResponse
                ? this.configuration.beforeResponse(response)
                : response
            )
            .catch(error => error.isGromitError
                ? Promise.reject(error)
                : Promise.reject(GromitError.fromAxiosError(error, this))
            );
    }
}

/**
 *
 * @class Gromit
 * @example
 *
 *
 * import Gromit from 'gromit';
 * const requester = Gromit({
 *     baseUrl: 'http://api.website.com'
 * });
 *
 * const {data} = await requester.get('/endpoint.json');
 *
 */
export default function GromitFactory(configuration: GromitConfiguration): Gromit {
    return new Gromit(configuration);
}
