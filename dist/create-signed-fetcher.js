"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignedFetcher = void 0;
const signature_v4_1 = require("@aws-sdk/signature-v4");
const credential_provider_node_1 = require("@aws-sdk/credential-provider-node");
const protocol_http_1 = require("@aws-sdk/protocol-http");
const sha256_js_1 = require("@aws-crypto/sha256-js");
const querystring_parser_1 = require("@aws-sdk/querystring-parser");
const get_fetch_1 = require("./get-fetch");
const get_headers_1 = require("./get-headers");
const createSignedFetcher = (opts) => {
    const service = opts.service;
    const region = opts.region || 'us-east-1';
    const credentials = opts.credentials || (0, credential_provider_node_1.defaultProvider)();
    const fetchFn = (0, get_fetch_1.getFetchFn)(opts.fetch);
    return async (input, init) => {
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        const headers = (0, get_headers_1.getHeaders)(init?.headers);
        headers.set('host', url.host);
        const request = new protocol_http_1.HttpRequest({
            hostname: url.hostname,
            path: url.pathname,
            protocol: url.protocol,
            method: init?.method.toUpperCase(),
            body: init?.body,
            query: (0, querystring_parser_1.parseQueryString)(url.search),
            headers: Object.fromEntries(headers.entries()),
        });
        const signer = new signature_v4_1.SignatureV4({
            credentials,
            service,
            region,
            sha256: sha256_js_1.Sha256,
        });
        const signedRequest = await signer.sign(request);
        return fetchFn(input, {
            headers: signedRequest.headers,
            body: signedRequest.body,
            method: signedRequest.method,
        });
    };
};
exports.createSignedFetcher = createSignedFetcher;
//# sourceMappingURL=create-signed-fetcher.js.map