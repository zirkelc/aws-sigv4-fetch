// src/create-signed-fetcher.ts
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";

// src/encode-rfc3986.ts
var encodeRfc3986 = (str) => {
  return str.replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
};

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
  const fetchFn = getFetchFn(opts.fetch);
  return async (input, init) => {
    const service = opts.service;
    const region = opts.region || "us-east-1";
    const credentials = opts.credentials || defaultProvider();
    const url = new URL(
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    );
    if (opts.encodeRfc3986) {
      url.pathname = encodeRfc3986(url.pathname);
      url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
        url.searchParams.append(encodeRfc3986(key), encodeRfc3986(value));
      });
    }
    const headers = getHeaders(init?.headers);
    headers.set("host", url.host);
    const request = new HttpRequest({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url.protocol,
      port: url.port ? Number(url.port) : void 0,
      username: url.username,
      password: url.password,
      method: init?.method?.toUpperCase() ?? "GET",
      // method must be uppercase
      body: init?.body,
      query: Object.fromEntries(url.searchParams.entries()),
      fragment: url.hash,
      headers: Object.fromEntries(headers.entries())
    });
    const signer = new SignatureV4({
      credentials,
      service,
      region,
      sha256: Sha256
    });
    const signedRequest = await signer.sign(request);
    return fetchFn(url, {
      ...init,
      headers: signedRequest.headers,
      body: signedRequest.body,
      method: signedRequest.method
    });
  };
};
export {
  createSignedFetcher
};
