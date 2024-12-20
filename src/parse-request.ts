interface ParsedRequest {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body?: ArrayBuffer;
}

const isObject = (input: unknown): input is Record<string, unknown> => {
  return typeof input === "object" && input !== null;
};

const isHeaders = (input: unknown): input is Headers => {
  if (input instanceof Headers) return true;

  if (isObject(input) && "forEach" in input && "get" in input && "has" in input && "set" in input) return true;

  return false;
};

/**
 * Copy the properties of `HeadersInit` to a plain object.
 * Lowercase the keys of the headers.
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
    // Creating a request from a request object will consume the body
    // Clone the request to keep the original request intact
    request = new Request(input.clone(), init);
  }

  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const headers = copyHeaders(request.headers);
  const body = request.body ? await request.arrayBuffer() : undefined;

  return {
    method,
    headers,
    url,
    body,
  };
};
