//@flow

// This implementation is based roughly on Boom: https://github.com/hapijs/boom

import {Gromit} from './Gromit';


const STATUS_CODE_MAP = {
    '100': {message: 'Continue', name: 'CONTINUE'},
    '101': {message: 'Switching Protocols', name: 'SWITCHING_PROTOCOLS'},
    '102': {message: 'Processing', name: 'PROCESSING'},
    '200': {message: 'OK', name: 'OK'},
    '201': {message: 'Created', name: 'CREATED'},
    '202': {message: 'Accepted', name: 'ACCEPTED'},
    '203': {message: 'Non-Authoritative Information', name: 'NON_AUTHORITATIVE_INFORMATION'},
    '204': {message: 'No Content', name: 'NO_CONTENT'},
    '205': {message: 'Reset Content', name: 'RESET_CONTENT'},
    '206': {message: 'Partial Content', name: 'PARTIAL_CONTENT'},
    '207': {message: 'Multi-Status', name: 'MULTI_STATUS'},
    '300': {message: 'Multiple Choices', name: 'MULTIPLE_CHOICES'},
    '301': {message: 'Moved Permanently', name: 'MOVED_PERMANENTLY'},
    '302': {message: 'Moved Temporarily', name: 'MOVED_TEMPORARILY'},
    '303': {message: 'See Other', name: 'SEE_OTHER'},
    '304': {message: 'Not Modified', name: 'NOT_MODIFIED'},
    '305': {message: 'Use Proxy', name: 'USE_PROXY'},
    '307': {message: 'Temporary Redirect', name: 'TEMPORARY_REDIRECT'},
    '400': {message: 'Bad Request', name: 'BAD_REQUEST'},
    '401': {message: 'Unauthorized', name: 'UNAUTHORIZED'},
    '402': {message: 'Payment Required', name: 'PAYMENT_REQUIRED'},
    '403': {message: 'Forbidden', name: 'FORBIDDEN'},
    '404': {message: 'Not Found', name: 'NOT_FOUND'},
    '405': {message: 'Method Not Allowed', name: 'METHOD_NOT_ALLOWED'},
    '406': {message: 'Not Acceptable', name: 'NOT_ACCEPTABLE'},
    '407': {message: 'Proxy Authentication Required', name: 'PROXY_AUTHENTICATION_REQUIRED'},
    '408': {message: 'Request Time-out', name: 'REQUEST_TIME_OUT'},
    '409': {message: 'Conflict', name: 'CONFLICT'},
    '410': {message: 'Gone', name: 'GONE'},
    '411': {message: 'Length Required', name: 'LENGTH_REQUIRED'},
    '412': {message: 'Precondition Failed', name: 'PRECONDITION_FAILED'},
    '413': {message: 'Request Entity Too Large', name: 'REQUEST_ENTITY_TOO_LARGE'},
    '414': {message: 'Request-URI Too Large', name: 'REQUEST_URI_TOO_LARGE'},
    '415': {message: 'Unsupported Media Type', name: 'UNSUPPORTED_MEDIA_TYPE'},
    '416': {message: 'Requested Range Not Satisfiable', name: 'REQUESTED_RANGE_NOT_SATISFIABLE'},
    '417': {message: 'Expectation Failed', name: 'EXPECTATION_FAILED'},
    '418': {message: 'I\'m a teapot', name: 'IM_A_TEAPOT'},
    '422': {message: 'Unprocessable Entity', name: 'UNPROCESSABLE_ENTITY'},
    '423': {message: 'Locked', name: 'LOCKED'},
    '424': {message: 'Failed Dependency', name: 'FAILED_DEPENDENCY'},
    '425': {message: 'Unordered Collection', name: 'UNORDERED_COLLECTION'},
    '426': {message: 'Upgrade Required', name: 'UPGRADE_REQUIRED'},
    '428': {message: 'Precondition Required', name: 'PRECONDITION_REQUIRED'},
    '429': {message: 'Too Many Requests', name: 'TOO_MANY_REQUESTS'},
    '431': {message: 'Request Header Fields Too Large', name: 'REQUEST_HEADER_FIELDS_TOO_LARGE'},
    '451': {message: 'Unavailable For Legal Reasons', name: 'UNAVAILABLE_FOR_LEGAL_REASONS'},
    '500': {message: 'Internal Server Error', name: 'INTERNAL_SERVER_ERROR'},
    '501': {message: 'Not Implemented', name: 'NOT_IMPLEMENTED'},
    '502': {message: 'Bad Gateway', name: 'BAD_GATEWAY'},
    '503': {message: 'Service Unavailable', name: 'SERVICE_UNAVAILABLE'},
    '504': {message: 'Gateway Time-out', name: 'GATEWAY_TIME_OUT'},
    '505': {message: 'HTTP Version Not Supported', name: 'HTTP_VERSION_NOT_SUPPORTED'},
    '506': {message: 'Variant Also Negotiates', name: 'VARIANT_ALSO_NEGOTIATES'},
    '507': {message: 'Insufficient Storage', name: 'INSUFFICIENT_STORAGE'},
    '509': {message: 'Bandwidth Limit Exceeded', name: 'BANDWIDTH_LIMIT_EXCEEDED'},
    '510': {message: 'Not Extended', name: 'NOT_EXTENDED'},
    '511': {message: 'Network Authentication Required', name: 'NETWORK_AUTHENTICATION_REQUIRED'}
};


export type GromitErrorResponseData = {
    statusCode: number,
    name: string,
    message: string,
    data: ?Object
};



export default class GromitError extends Error {
    statusCode: number;
    name: string;
    message: string;
    data: ?Object;
    isGromitError: bool = true;


    constructor(
        error: Error,
        errorData: GromitErrorResponseData
    ) {
        super(error);
        this.statusCode = errorData.statusCode;
        this.name = errorData.name;
        this.message = errorData.message;
        this.data = errorData.data;
    }


    serialize(): GromitError {
        const message = `[${this.statusCode}][${this.name}] ${this.message}`;

        return new GromitError(this, {
            statusCode: this.statusCode,
            name: this.name,
            message: message,
            data: this.data
        });
    }


    static deserialize(error: Error): GromitError {
        const errData = error.message.match(/^\[(.+?)\]\[(.+?)\](.+$)/);
        if(!errData) return GromitError.wrap(error);

        const message = errData[3];
        const statusCode = parseInt(errData[1], 10);
        const name = errData[2];

        return GromitError.wrap(error, statusCode, message, name);
    }


    static wrap(error: Error, statusCode: ?number, message: ?string, name: ?string, data: ?Object): GromitError {
        const errorStatusCode = statusCode || 500;
        const defaultErrorData = STATUS_CODE_MAP[errorStatusCode];
        const errorMessage = message || error.message;
        const errorName = name || defaultErrorData.name;

        return new GromitError(error, {
            statusCode: errorStatusCode,
            name: errorName,
            message: errorMessage,
            data: data
        });
    }

    static create(statusCode: ?number, message: ?string, name: ?string, data: ?Object): GromitError {
        const errorStatusCode = statusCode || 500;
        const defaultErrorData = STATUS_CODE_MAP[errorStatusCode];
        const errorMessage = message || defaultErrorData.message;
        const errorName = name || defaultErrorData.name;

        const error = new Error(errorMessage);
        Error.captureStackTrace(error, GromitError.create);


        return new GromitError(error, {
            statusCode: errorStatusCode,
            name: errorName,
            message: errorMessage,
            data: data
        });
    }

    static badRequest(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(400, message, name, data);
    }

    static unauthorized(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(401, message, name, data);
    }

    static paymentRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(402, message, name, data);
    }

    static forbidden(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(403, message, name, data);
    }

    static notFound(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(404, message, name, data);
    }

    static methodNotAllowed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(405, message, name, data);
    }

    static notAcceptable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(406, message, name, data);
    }

    static proxyAuthRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(407, message, name, data);
    }

    static clientTimeout(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(408, message, name, data);
    }

    static conflict(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(409, message, name, data);
    }

    static resourceGone(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(410, message, name, data);
    }

    static lengthRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(411, message, name, data);
    }

    static preconditionFailed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(412, message, name, data);
    }

    static entityTooLarge(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(413, message, name, data);
    }

    static uriTooLong(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(414, message, name, data);
    }

    static unsupportedMediaType(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(415, message, name, data);
    }

    static rangeNotSatisfiable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(416, message, name, data);
    }

    static expectationFailed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(417, message, name, data);
    }

    static teapot(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(418, message, name, data);
    }

    static badData(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(422, message, name, data);
    }

    static locked(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(423, message, name, data);
    }

    static preconditionRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(428, message, name, data);
    }

    static tooManyRequests(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(429, message, name, data);
    }

    static illegal(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(451, message, name, data);
    }

    static notImplemented(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(501, message, name, data);
    }

    static badGateway(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(502, message, name, data);
    }

    static serverUnavailable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(503, message, name, data);
    }

    static gatewayTimeout(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(504, message, name, data);
    }

    static httpVersionNotSupported(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(505, message, name, data);
    }

    static variantAlsoNegotiates(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(506, message, name, data);
    }

    static insufficientStorage(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(507, message, name, data);
    }

    static bandwidthLimitExceeded(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(509, message, name, data);
    }

    static notExtended(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(510, message, name, data);
    }

    static networkAuthenticationRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(511, message, name, data);
    }

    static fromAxiosError(error: Object, requester: Gromit): GromitError {
        const statusCode = error.response ? error.response.status : 500;
        return GromitError.wrap(error, statusCode, error.message, null, {
            requester: requester,
            response: error.response,
            request: error.request
        });
    }

}
