//@flow

export default function ExtendableError(error: Error) {
    Object.defineProperty(this, 'name', {
        enumerable: false,
        writable: true,
        value: 'Error'
    });

    Object.defineProperty(this, 'message', {
        enumerable: false,
        writable: true,
        value: error.message
    });

    Object.defineProperty(this, 'stack', {
        enumerable: false,
        writable: false,
        value: error.stack
    });
}

if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(ExtendableError.prototype, Error.prototype);
} else {
    ExtendableError.prototype = Object.create(Error.prototype, {
        constructor: {value: ExtendableError}
    });
}