declare global {
  interface RequestInit {
    duplex?: "half" | string;
  }

  interface Request {
    duplex?: "half" | string;
  }
}

interface ParsedRequest extends RequestInit {
  url: URL;
  headers: Record<string, string>;
}

const isObject = (input: unknown): input is Record<string, unknown> => {
  return typeof input === "object" && input !== null;
};

const isRequest = (input: unknown): input is Request => {
  if (input instanceof Request) return true;

  if (isObject(input) && "body" in input && "method" in input && "url" in input) return true;

  return false;
};

const isHeaders = (input: unknown): input is Headers => {
  if (input instanceof Headers) return true;

  if (isObject(input) && "forEach" in input && "get" in input && "has" in input && "set" in input) return true;

  return false;
};

/**
 * Copy the properties of `HeadersInit` to a plain object.
 * `HeadersInit` is a union of `[string, string][]`, `Record<string, string>`, and `Headers`
 */
export const copyHeaders = (headers?: HeadersInit): Record<string, string> => {
  const headersMap = new Map<string, string>();

  if (Array.isArray(headers)) {
    headers.forEach((header) => headersMap.set(header[0].toLowerCase(), header[1]));
  } else if (isHeaders(headers)) {
    headers.forEach((value, key) => headersMap.set(key.toLowerCase(), value));
  } else if (isObject(headers)) {
    Object.entries(headers).forEach(([key, value]) => headersMap.set(key.toLowerCase(), value));
  }

  return Object.fromEntries(headersMap.entries());
};

/**
 * Extract the URL, method, body, and headers from a request.
 * Input can be a `string`, `URL`, or `Request` object.
 * Init is an optional `RequestInit` object. If provided, it will override the values in the `Request` object.
 */
export const parseRequest = async (input: string | Request | URL, init?: RequestInit): Promise<ParsedRequest> => {
  let finalRequest: Request;

  if (typeof input === "string" || input instanceof URL) {
    // If input is a string or a URL, first create a request from it
    // If input is a Request, we directly construct from it.
    const url = input instanceof URL ? input.href : input;
    finalRequest = new Request(url, init);
  } else {
    // input is a Request, create a new Request that applies init overrides
    finalRequest = new Request(input, init);
  }

  // Extract properties from finalRequest
  const method = finalRequest.method.toUpperCase();
  const url = new URL(finalRequest.url);
  const headers = copyHeaders(finalRequest.headers);

  // Reading the body: If the request has a body, clone and read it.
  // This example uses arrayBuffer, but you could use .text(), .json(), etc.
  let body: BodyInit | null | undefined = undefined;
  if (finalRequest.body) {
    // Clone and read the body
    const clonedRequest = finalRequest.clone();
    body = await clonedRequest.arrayBuffer();
  }

  return {
    method,
    headers,
    url,
    body,

    credentials: finalRequest.credentials,
    cache: finalRequest.cache,
    mode: finalRequest.mode,
    redirect: finalRequest.redirect,
    referrer: finalRequest.referrer,
    referrerPolicy: finalRequest.referrerPolicy,
    integrity: finalRequest.integrity,
    signal: finalRequest.signal,
    duplex: finalRequest.duplex,
  };

  // let url = "";
  // let method = "GET";
  // let headers: HeadersInit | undefined = undefined;
  // let body: BodyInit | null | undefined = undefined;

  // /**
  //  * Input can be a `string`, `URL`, or `Request` object
  //  * `RequestInfo` is a union of `Request` and `string`
  //  */
  // if (typeof input === "string") {
  //   url = input;
  //   method = init?.method ?? "GET";
  //   headers = init?.headers;
  //   body = init?.body;
  // } else if (input instanceof URL) {
  //   url = input.href;
  //   method = init?.method ?? "GET";
  //   headers = init?.headers;
  //   body = init?.body;
  // } else if (isRequest(input)) {
  //   url = input.url;
  //   method = init?.method ?? input.method;
  //   headers = init?.headers ?? input.headers;
  //   body = init?.body ?? input.body ? await input.clone().arrayBuffer() : undefined;
  // }

  // return {
  //   ...init,
  //   method: method.toUpperCase(), // method must be uppercase
  //   headers: copyHeaders(headers), // must be a plain object
  //   url: new URL(url),
  //   body,
  // };
};
