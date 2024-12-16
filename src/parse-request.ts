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
 * Copy the properties of a `Request` object to a plain object.
 * This is necessary because `Request` is not a plain object and its properties are not enumerable.
 */
const copyRequest = (input: Request): Record<string, unknown> => {
  return Object.getOwnPropertyNames(Request.prototype).reduce<Record<string, unknown>>((acc, prop) => {
    acc[prop] = input[prop as keyof Request];
    return acc;
  }, {});
};

/**
 * Copy the properties of `HeadersInit` to a plain object.
 * `HeadersInit` is a union of `[string, string][]`, `Record<string, string>`, and `Headers`
 */
const copyHeaders = (headers?: HeadersInit): Record<string, string> => {
  const headersMap = new Map<string, string>();

  if (Array.isArray(headers)) {
    headers.forEach((header) => headersMap.set(header[0], header[1]));
  } else if (isHeaders(headers)) {
    headers.forEach((value, key) => headersMap.set(key, value));
  } else if (isObject(headers)) {
    Object.entries(headers).forEach(([key, value]) => headersMap.set(key, value));
  }

  return Object.fromEntries(headersMap.entries());
};

/**
 * Extract the URL, method, body, and headers from a request.
 * Input can be a `string`, `URL`, or `Request` object.
 * Init is an optional `RequestInit` object. If provided, it will override the values in the `Request` object.
 */
export const parseRequest = (input: string | Request | URL, init?: RequestInit): ParsedRequest => {
  let url = "";
  let request: RequestInit = {};

  /**
   * Input can be a `string`, `URL`, or `Request` object
   * `RequestInfo` is a union of `Request` and `string`
   */
  if (typeof input === "string") {
    url = input;
    request = {
      ...init,
    };
  } else if (input instanceof URL) {
    url = input.href;
    request = {
      ...init,
    };
  } else if (isRequest(input)) {
    url = input.url;
    request = {
      ...copyRequest(input),
      ...init,
    };
  }

  const headers = copyHeaders(request.headers); // must be a plain object
  const method = request.method?.toUpperCase() ?? "GET"; // method must be uppercase

  if (!url) throw new Error("Could not parse URL from input");

  return {
    ...request,
    method,
    headers,
    url: new URL(url),
  };
};
