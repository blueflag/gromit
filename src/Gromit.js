// @flow
import axios from 'axios';
import GromitError from './GromitError';
import GromitResponse from './GromitResponse';

export type GromitBodyData = string | Object | ArrayBuffer | $ArrayBufferView | URLSearchParams | FormData | File | Blob | stream$Readable | Buffer;
export type GromitParamData = Object | URLSearchParams;
export type GromitMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

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
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream',
    maxContentLength?: number,
    maxRedirects?: number,
    autoFetch?: bool,
    onUploadProgress?: (progressEvent: ProgressEvent) => void,
    onDownloadProgress?: (progressEvent: ProgressEvent) => void,
    beforeResponse?: (response: GromitResponse) => any
};

const defaultConfig = {
    method: 'get',
    autoFetch: true
};


export class Gromit {
    configuration: GromitConfiguration;

    constructor(configuration: GromitConfiguration) {
        this.configuration = {
            ...defaultConfig,
            ...configuration
        };
    }

    configure(configurator: (GromitConfiguration) => GromitConfiguration): Gromit {
        return new Gromit(configurator(this.configuration));
    }

    uploadProgress(cb: (progressEvent: ProgressEvent) => void): Gromit {
        return new Gromit({
            ...this.configuration,
            onUploadProgress: cb
        });
    }

    downloadProgress(cb: (progressEvent: ProgressEvent) => void): Gromit {
        return new Gromit({
            ...this.configuration,
            onDownloadProgress: cb
        });
    }

    request(
        method: ?GromitMethod,
        path: ?string,
        data: ?GromitBodyData,
        params: ?GromitParamData
    ): Promise<GromitResponse> {
        return new Gromit({
            ...this.configuration,
            method: method || this.configuration.method,
            path: typeof path === 'string' ? path : this.configuration.path,
            data: data || this.configuration.data,
            params: params || this.configuration.params
        }).fetch();
    }

    get(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('get', path, null, params);
    }

    post(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('post', path, data, params);
    }

    put(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('put', path, data, params);
    }

    patch(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('patch', path, data, params);
    }

    delete(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('delete', path, null, params);
    }

    head(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('head', path, null, params);
    }

    options(path?: string, params?: GromitParamData): Promise<GromitResponse> {
        return this.request('options', path, null, params);
    }


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

export default function GromitFactory(configuration: GromitConfiguration): Gromit {
    return new Gromit(configuration);
}
