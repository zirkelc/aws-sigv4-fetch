var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createSignedFetcher: () => createSignedFetcher
});
module.exports = __toCommonJS(src_exports);

// src/create-signed-fetcher.ts
var import_sha256_js = require("@aws-crypto/sha256-js");
var import_credential_provider_node = require("@aws-sdk/credential-provider-node");
var import_protocol_http = require("@aws-sdk/protocol-http");
var import_signature_v4 = require("@aws-sdk/signature-v4");

// src/get-fetch.ts
var getFetchFn = (customFetchFn) => {
  if (customFetchFn) {
    return customFetchFn;
  }
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    return window.fetch.bind(window);
  }
  if (typeof globalThis !== "undefined" && typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }
  throw new Error("No fetch implementation found");
};

// src/get-headers.ts
var getHeaders = (init) => {
  const headers = /* @__PURE__ */ new Map();
  if (init === void 0)
    return headers;
  if (Array.isArray(init)) {
    init.forEach((header) => headers.set(header[0], header[1]));
    return headers;
  }
  if ("forEach" in init && typeof init.forEach === "function") {
    init.forEach((value, key) => headers.set(key, value));
    return headers;
  }
  if (typeof init === "object") {
    Object.entries(init).forEach(([key, value]) => headers.set(key, value));
    return headers;
  }
  throw new Error("Invalid headers");
};

// src/create-signed-fetcher.ts
var createSignedFetcher = (opts) => {
  const service = opts.service;
  const region = opts.region || "us-east-1";
  const credentials = opts.credentials || (0, import_credential_provider_node.defaultProvider)();
  const fetchFn = getFetchFn(opts.fetch);
  return async (input, init) => {
    const url = new URL(
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    );
    const headers = getHeaders(init?.headers);
    headers.set("host", url.host);
    const request = new import_protocol_http.HttpRequest({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url.protocol,
      port: url.port ? Number(url.port) : void 0,
      username: url.username,
      password: url.password,
      method: init?.method.toUpperCase(),
      // method must be uppercase
      body: init?.body,
      query: Object.fromEntries(url.searchParams.entries()),
      fragment: url.hash,
      headers: Object.fromEntries(headers.entries())
    });
    const signer = new import_signature_v4.SignatureV4({
      credentials,
      service,
      region,
      sha256: import_sha256_js.Sha256
    });
    const signedRequest = await signer.sign(request);
    return fetchFn(input, {
      ...init,
      headers: signedRequest.headers,
      body: signedRequest.body,
      method: signedRequest.method
    });
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createSignedFetcher
});
