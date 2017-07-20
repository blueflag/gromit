//@flow
import {Gromit} from './Gromit';

export type GromitResponseResponseData = {
    statusCode: number,
    statusText: string,
    data: any,
    headers: Object,
    request: XMLHttpRequest | http$ClientRequest
};

export default class GromitResponse {
    requester: Gromit;
    statusCode: number;
    statusText: string;
    data: any;
    headers: Object;
    request: XMLHttpRequest | http$ClientRequest;
    constructor(
        responseData: GromitResponseResponseData,
        requester: Gromit
    ) {
        this.requester = requester;
        this.request = responseData.request;
        this.data = responseData.data;
        this.headers = responseData.headers;
        this.statusCode = responseData.statusCode;
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
