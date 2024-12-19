declare global {
  interface RequestInit {
    duplex?: "half";
  }

  interface Request {
    duplex?: "half";
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
  let request: Request;

  /**
   * Input can be a `string`, `URL`, or `Request` object
   * `RequestInfo` is a union of `Request` and `string`
   */
  if (typeof input === "string" || input instanceof URL) {
    const url = input instanceof URL ? input.href : input;
    request = new Request(url, init);
  } else {
    request = new Request(input, init);
  }

  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const headers = copyHeaders(request.headers);
  const body = request.body ? await request.clone().arrayBuffer() : undefined;

  return {
    method,
    headers,
    url,
    body,
    credentials: request.credentials,
    cache: request.cache,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    integrity: request.integrity,
    signal: request.signal,
    duplex: request.duplex,
  };
};
