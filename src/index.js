//@flow
import axios from 'axios';

type GromitBodyData = string | Object | ArrayBuffer | $ArrayBufferView | URLSearchParams | FormData | File | Blob | stream$Readable | Buffer;
type GromitParamData = Object | URLSearchParams;
type GromitMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

type GromitConfiguration = {
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
    onDownloadProgress?: (progressEvent: ProgressEvent) => void
};


const defaultConfig = {
    method: 'get',
    autoFetch: true
};

type GromitSuccessResponseData = {
    statusCode: number,
    statusText: string,
    data: any,
    headers: Object,
    request: XMLHttpRequest | http$ClientRequest
};

export class GromitSuccess {
    requester: Gromit;
    statusCode: number;
    statusText: string;
    data: any;
    headers: Object;
    request: XMLHttpRequest | http$ClientRequest;
    constructor(
        responseData: GromitSuccessResponseData,
        requester: Gromit
    ) {
        this.requester = requester;
        this.request = responseData.request;
        this.data = responseData.data;
        this.headers = responseData.headers;
        this.statusCode = responseData.statusCode;
        this.statusText = responseData.statusText;
    }

    static fromAxiosResponse(response: Object, requester: Gromit): GromitSuccess {
        return new GromitSuccess({
            request: response.request,
            data: response.data,
            headers: response.headers,
            statusCode: response.status,
            statusText: response.statusText
        }, requester);
    }
}


type GromitErrorResponseData = {
    statusCode: number
};

export class GromitError extends Error {
    requester: Gromit;
    statusCode: number;
    constructor(
        error: Error,
        errorData: GromitErrorResponseData,
        requester: Gromit
    ) {
        super(error);
        this.requester = requester;
        this.statusCode = errorData.statusCode;
    }

    static fromAxiosError(error: Object, requester: Gromit): GromitError {
        return new GromitError(error, {
            statusCode: error.response.status
        }, requester);
    }
}


class Gromit {
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
    ): Promise<GromitSuccess> {
        return new Gromit({
            ...this.configuration,
            method: method || this.configuration.method,
            path: typeof path === 'string' ? path : this.configuration.path,
            data: data || this.configuration.data,
            params: params || this.configuration.params
        }).fetch();
    }

    get(path?: string, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('get', path, null, params);
    }

    post(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('post', path, data, params);
    }

    put(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('put', path, data, params);
    }

    patch(path?: string, data?: GromitBodyData, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('patch', path, data, params);
    }

    delete(path?: string, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('delete', path, null, params);
    }

    head(path?: string, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('head', path, null, params);
    }

    options(path?: string, params?: GromitParamData): Promise<GromitSuccess> {
        return this.request('options', path, null, params);
    }


    fetch(): Promise<GromitSuccess> {
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
            .then(response => GromitSuccess.fromAxiosResponse(response, this))
            .catch(error => Promise.reject(GromitError.fromAxiosError(error, this)));

    }

}


export default function GromitFactory(configuration: GromitConfiguration): Gromit {
    return new Gromit(configuration);
}


export const graphqlRequest = (url: string, getToken: () => Promise<string>) => async (query: string, variables: Object): Promise<Object> => {
    const token = await getToken();
    return GromitFactory({headers: {
        'Authorization': token
    }})
        .post(url, {query, variables})
        .then(response => response.data);
};
