type ParsedRequest = {
  url: URL;
  method: string;
  body: BodyInit | undefined | null;
  headers: Record<string, string>;
};

/**
 * Extract the URL, method, body, and headers from a request.
 * Input can be a string, URL, or Request object.
 * Init is an optional RequestInit object. If provided, it will override the values in the Request object.
 */
export const parseRequest = (input: RequestInfo | URL, init?: RequestInit): ParsedRequest => {
  let url = "";
  let method = "GET";
  let body = undefined;
  let headers = new Map<string, string>();

  // Input can be a string, URL, or Request object
  // type RequestInfo = Request | string;
  if (typeof input === "string") {
    url = input;
    method = "GET";
  } else if (input instanceof URL) {
    url = input.href;
    method = "GET";
    body = undefined;
  } else if (input instanceof Request) {
    url = input.url;
    method = input.method;
    body = input.body;
    input.headers.forEach((value, key) => headers.set(key, value));
  }

  if (init?.method) {
    method = init.method;
  }

  if (init?.body) {
    body = init.body;
  }

  if (init?.headers) {
    // Headers from RequestInit replace all existing headers from the Request object
    headers = new Map<string, string>();

    // Headers can be an array, Headers object, or Record<string, string>
    // type HeadersInit = [string, string][] | Record<string, string> | Headers;
    if (Array.isArray(init.headers)) {
      init.headers.forEach((header) => headers.set(header[0], header[1]));
    } else if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => headers.set(key, value));
    } else if (typeof init.headers === "object") {
      Object.entries(init.headers).forEach(([key, value]) => headers.set(key, value));
    }
  }

  return {
    url: new URL(url),
    method: method.toUpperCase(), // method must be uppercase
    body,
    headers: Object.fromEntries(headers.entries()), // must be a plain object
  };
};
