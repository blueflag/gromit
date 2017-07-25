//@flow

export default function ExtendableError(message: string) {
    Object.defineProperty(this, 'name', {
        enumerable: false,
        writable: false,
        value: 'Error'
    });

    Object.defineProperty(this, 'message', {
        enumerable: false,
        writable: true,
        value: message
    });

    if (Error.hasOwnProperty('captureStackTrace')) { // V8
        Error.captureStackTrace(this, ExtendableError);
    } else {
        Object.defineProperty(this, 'stack', {
            enumerable: false,
            writable: false,
            value: (new Error(message)).stack
        });
    }
}

if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(ExtendableError.prototype, Error.prototype);
} else {
    ExtendableError.prototype = Object.create(Error.prototype, {
        constructor: {value: ExtendableError}
    });
}