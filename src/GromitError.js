//@flow


/**
 *
 * @module Gromit
 *
 */

// This implementation is based roughly on Boom: https://github.com/hapijs/boom

import {Gromit} from './Gromit';
import ExtendableError from './util/ExtendableError';

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


/**
 *
 * Gromit Error Object
 * @extends Error
 *
 */
// $FlowFixMe: flow complains about the hacky extending from a function here but it is needed for browser support
export default class GromitError extends ExtendableError {
    statusCode: number;
    name: string;
    message: string;
    data: ?Object;
    isGromitError: bool;

    /**
     *
     * Create a new GromitError
     * @param {Error} error - the error object to extend from
     * @param {Object} errorData - An object of data to apply to the error
     * @param {number} errorData.statusCode - A HTTP status code to use for the error
     * @param {string} errorData.name - a unique name for this error, eg. `USER_DOES_NOT_EXIST`
     * @param {string} errorData.message - The error message
     * @param {Object} errorData.data - extra data to apply to the error
     *
     */
    constructor(
        error: Object,
        errorData: GromitErrorResponseData
    ) {

        super(error);


        /**
         * The HTTP status code for this error
         */
        this.statusCode = errorData.statusCode;

        /**
         * A unique name for the error
         */
        this.name = errorData.name;

        /**
         * The HTTP status code for this error
         */
        this.message = errorData.message;

        /**
         * Misc data about the error
         */
        this.data = errorData.data;

        /**
         * Indicates that this is a GromitError (should always be true)
         */
        this.isGromitError = true;
    }

    /**
     *
     * Serialize the error statusCode and name into the error message so that the error can
     * pass through something that strips away extra data. (looking at you graphql-js)
     * @return {GromitError} - A new gromit error
     */
    serialize(): GromitError {
        const message = `[${this.statusCode}][${this.name}] ${this.message}`;

        return new GromitError(this, {
            statusCode: this.statusCode,
            name: this.name,
            message: message,
            data: this.data
        });
    }


    toJSON(): Object {
        return {
            statusCode: this.statusCode,
            message: this.message,
            name: this.name,
            data: this.data
        };
    }

    /**
     *
     * Deserialize a serialized GromitError. This will pull the serialized data out of the error
     * message and add it back in as structured data
     * @param {Error} error - The error to deserialize
     * @return {GromitError} - A new GromitError
     */
    static deserialize(error: Object): GromitError {
        const errData = error.message.match(/^\[(.+?)\]\[(.+?)\]\W(.+$)/);
        if(!errData) return GromitError.wrap(error);

        const message = errData[3];
        const statusCode = parseInt(errData[1], 10);
        const name = errData[2];

        return GromitError.wrap(error, statusCode, message, name);
    }

    /**
     *
     * Wrap an existing error to turn it into a GromitError with the provided data
     * @param {Error} error - The error object to wrap
     * @param {number} [statusCode=500] - The status code to apply to the error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static wrap(error: Object, statusCode: ?number, message: ?string, name: ?string, data: ?Object): GromitError {
        const errorStatusCode = statusCode || parseInt(error.statusCode, 10) || 500;
        const defaultErrorData = STATUS_CODE_MAP[errorStatusCode];
        const errorMessage = message || error.message || defaultErrorData.message;
        const errorName = name || error.name || defaultErrorData.name;

        return new GromitError(error, {
            statusCode: errorStatusCode,
            name: errorName,
            message: errorMessage,
            data: data
        });
    }

    /**
     *
     * Create a new error from scratch
     * @param {number} [statusCode=500] - The status code to apply to the error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static create(statusCode: ?number, message: ?string, name: ?string, data: ?Object, caller: ?Function): GromitError {
        const errorStatusCode = statusCode || 500;
        const defaultErrorData = STATUS_CODE_MAP[errorStatusCode];
        const errorMessage = message || defaultErrorData.message;
        const errorName = name || defaultErrorData.name;

        const error = new Error(errorMessage);

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(error, caller || GromitError.create);
        }

        return new GromitError(error, {
            statusCode: errorStatusCode,
            name: errorName,
            message: errorMessage,
            data: data
        });
    }


    /**
     * Create a new badRequest (400) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static badRequest(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(400, message, name, data, GromitError.badRequest);
    }

    /**
     * Create a new unauthorized (401) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static unauthorized(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(401, message, name, data, GromitError.unauthorized);
    }

    /**
     * Create a new paymentRequired (402) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static paymentRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(402, message, name, data, GromitError.paymentRequired);
    }

    /**
     * Create a new forbidden (403) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static forbidden(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(403, message, name, data, GromitError.forbidden);
    }

    /**
     * Create a new notFound (404) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static notFound(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(404, message, name, data, GromitError.notFound);
    }

    /**
     * Create a new methodNotAllowed (405) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static methodNotAllowed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(405, message, name, data, GromitError.methodNotAllowed);
    }

    /**
     * Create a new notAcceptable (406) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static notAcceptable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(406, message, name, data, GromitError.notAcceptable);
    }

    /**
     * Create a new proxyAuthRequired (407) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static proxyAuthRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(407, message, name, data, GromitError.proxyAuthRequired);
    }

    /**
     * Create a new clientTimeout (408) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static clientTimeout(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(408, message, name, data, GromitError.clientTimeout);
    }

    /**
     * Create a new conflict (409) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static conflict(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(409, message, name, data, GromitError.conflict);
    }

    /**
     * Create a new resourceGone (410) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static resourceGone(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(410, message, name, data, GromitError.resourceGone);
    }

    /**
     * Create a new lengthRequired (411) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static lengthRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(411, message, name, data, GromitError.lengthRequired);
    }

    /**
     * Create a new preconditionFailed (412) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static preconditionFailed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(412, message, name, data, GromitError.preconditionFailed);
    }

    /**
     * Create a new entityTooLarge (413) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static entityTooLarge(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(413, message, name, data, GromitError.entityTooLarge);
    }

    /**
     * Create a new uriTooLong (414) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static uriTooLong(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(414, message, name, data, GromitError.uriTooLong);
    }

    /**
     * Create a new unsupportedMediaType (415) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static unsupportedMediaType(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(415, message, name, data, GromitError.unsupportedMediaType);
    }

    /**
     * Create a new rangeNotSatisfiable (416) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static rangeNotSatisfiable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(416, message, name, data, GromitError.rangeNotSatisfiable);
    }

    /**
     * Create a new expectationFailed (417) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static expectationFailed(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(417, message, name, data, GromitError.expectationFailed);
    }

    /**
     * Create a new teapot (418) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static teapot(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(418, message, name, data, GromitError.teapot);
    }

    /**
     * Create a new badData (422) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static badData(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(422, message, name, data, GromitError.badData);
    }

    /**
     * Create a new locked (423) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static locked(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(423, message, name, data, GromitError.locked);
    }

    /**
     * Create a new preconditionRequired (428) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static preconditionRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(428, message, name, data, GromitError.preconditionRequired);
    }

    /**
     * Create a new tooManyRequests (429) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static tooManyRequests(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(429, message, name, data, GromitError.tooManyRequests);
    }

    /**
     * Create a new illegal (451) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static illegal(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(451, message, name, data, GromitError.illegal);
    }

    /**
     * Create a new internal (500) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static internal(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(500, message, name, data, GromitError.internal);
    }

    /**
     * Create a new notImplemented (501) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static notImplemented(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(501, message, name, data, GromitError.notImplemented);
    }

    /**
     * Create a new badGateway (502) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static badGateway(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(502, message, name, data, GromitError.badGateway);
    }

    /**
     * Create a new serverUnavailable (503) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static serverUnavailable(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(503, message, name, data, GromitError.serverUnavailable);
    }

    /**
     * Create a new gatewayTimeout (504) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static gatewayTimeout(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(504, message, name, data, GromitError.gatewayTimeout);
    }

    /**
     * Create a new httpVersionNotSupported (505) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static httpVersionNotSupported(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(505, message, name, data, GromitError.httpVersionNotSupported);
    }

    /**
     * Create a new variantAlsoNegotiates (506) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static variantAlsoNegotiates(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(506, message, name, data, GromitError.variantAlsoNegotiates);
    }

    /**
     * Create a new insufficientStorage (507) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static insufficientStorage(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(507, message, name, data, GromitError.insufficientStorage);
    }

    /**
     * Create a new bandwidthLimitExceeded (509) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static bandwidthLimitExceeded(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(509, message, name, data, GromitError.bandwidthLimitExceeded);
    }

    /**
     * Create a new notExtended (510) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static notExtended(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(510, message, name, data, GromitError.notExtended);
    }

    /**
     * Create a new networkAuthenticationRequired (511) error
     * @param {string} [message] - Override the existing error message if provided
     * @param {string} [name] - A unique name for the error. If not provided the default name for the status code will be used.
     * @param {Object} [data] - Extra data to add to the error
     * @return {GromitError} - A new GromitError
     */
    static networkAuthenticationRequired(message: ?string, name: ?string, data: ?Object): GromitError {
        return GromitError.create(511, message, name, data, GromitError.networkAuthenticationRequired);
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
