import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedFetcher } from "../create-signed-fetcher.js";

const urls = [
  // "http://example.com",
  // "http://example.com/foo",
  // "http://example.com/foo?bar=baz",
  "http://example.com/foo?bar=baz#qux",
];

beforeEach(() => {
  vi.resetAllMocks();
});

const headersSigned = expect.objectContaining({
  host: "example.com",
  "x-amz-date": expect.stringMatching(/\d{8}T\d{6}Z/),
  "x-amz-security-token": "dummySessionToken",
  "x-amz-content-sha256": expect.stringMatching(/^[a-f0-9]{64}$/),
  authorization: expect.stringMatching(
    /AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/,
  ),
});

const headersUnsignedPayload = expect.objectContaining({
  host: "example.com",
  "x-amz-date": expect.stringMatching(/\d{8}T\d{6}Z/),
  "x-amz-security-token": "dummySessionToken",
  "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
  authorization: expect.stringMatching(
    /AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/,
  ),
});

describe("createSignedFetcher", () => {
  const fetchMock = vi.fn<Parameters<typeof fetch>>();

  const fetcher = createSignedFetcher({
    service: "dummyService",
    region: "dummyRegion",
    credentials: {
      accessKeyId: "dummyAccessKeyId",
      secretAccessKey: "dummySecretAccessKey",
      sessionToken: "dummySessionToken",
    },
    fetch: fetchMock,
  });

  describe.each(urls)("URL: %s", (url) => {
    describe.each([undefined, "GET", "POST"])("Method: %s", (method) => {
      const expectedMethod = method ?? "GET";

      it("should fetch with string", async () => {
        await fetcher(url, method ? { method } : undefined);

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual(expectedMethod);
        expect(fetchInit?.body).toEqual(undefined);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), method ? { method } : undefined);

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual(expectedMethod);
        expect(fetchInit?.body).toEqual(undefined);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, method ? { method } : undefined));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual(expectedMethod);
        expect(fetchInit?.body).toEqual(null);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with Request and options", async () => {
        await fetcher(new Request(url), method ? { method } : undefined);

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual(expectedMethod);
        expect(fetchInit?.body).toEqual(null);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });
    });

    describe("Body: undefined", () => {
      const body = undefined;

      it("should fetch with string", async () => {
        await fetcher(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(null);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });
    });

    describe(`Body: String("foo")`, () => {
      const body = "foo";

      it("should fetch with string", async () => {
        await fetcher(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });
    });

    describe(`Body: URLSearchParams({ foo: "bar" })`, () => {
      const body = new URLSearchParams({ foo: "bar" });

      it("should fetch with string", async () => {
        await fetcher(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });
    });

    describe(`Body: FormData({ foo: "bar" })`, () => {
      const body = new FormData();
      body.append("foo", "bar");

      it("should fetch with string", async () => {
        await fetcher(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });
    });

    describe(`Body: Blob(["foo"])`, () => {
      const body = new Blob(["foo"]);

      it("should fetch with string", async () => {
        await fetcher(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with URL", async () => {
        await fetcher(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });

      it("should fetch with Request", async () => {
        await fetcher(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);
      });
    });
  });
});
