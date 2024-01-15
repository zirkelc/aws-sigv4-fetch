"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFetchFn = void 0;
const getFetchFn = (customFetchFn) => {
    if (customFetchFn) {
        return customFetchFn;
    }
    if (typeof window !== "undefined" && typeof window.fetch === "function") {
        return window.fetch.bind(window);
    }
    if (typeof globalThis !== "undefined" &&
        typeof globalThis.fetch === "function") {
        return globalThis.fetch.bind(globalThis);
    }
    throw new Error("No fetch implementation found");
};
exports.getFetchFn = getFetchFn;
//# sourceMappingURL=get-fetch.js.map