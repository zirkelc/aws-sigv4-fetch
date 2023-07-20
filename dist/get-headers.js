"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaders = void 0;
const getHeaders = (init) => {
    const headers = new Map();
    if (init === undefined)
        return headers;
    if (Array.isArray(init)) {
        init.forEach((header) => headers.set(header[0], header[1]));
        return headers;
    }
    if ('forEach' in init && typeof init.forEach === 'function') {
        init.forEach((value, key) => headers.set(key, value));
        return headers;
    }
    if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => headers.set(key, value));
        return headers;
    }
    throw new Error('Invalid headers');
};
exports.getHeaders = getHeaders;
//# sourceMappingURL=get-headers.js.map