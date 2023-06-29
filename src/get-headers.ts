export const getHeaders = (init?: HeadersInit) => {
  const headers = new Map<string, string>();

  if (init === undefined) return headers;

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
