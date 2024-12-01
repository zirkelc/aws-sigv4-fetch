import type { AwsCredentialIdentity } from "@aws-sdk/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedFetcher } from "../create-signed-fetcher.js";

const fetchMock = vi.fn(fetch);
let signedFetch: typeof fetch;

vi.useFakeTimers();
vi.setSystemTime("2024-01-01T00:00:00.000Z");

const credentials: AwsCredentialIdentity = {
  accessKeyId: "dummyAccessKeyId",
  secretAccessKey: "dummySecretAccessKey",
  sessionToken: "dummySessionToken",
};

beforeEach(() => {
  vi.resetAllMocks();

  signedFetch = createSignedFetcher({
    service: "dummyService",
    region: "dummyRegion",
    credentials,
    fetch: fetchMock,
  });
});

const url = "http://example.com/foo?bar=baz#qux";

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
  describe("GET", () => {
    const expectedMethod = "GET";

    it("should fetch with string", async () => {
      await signedFetch(url);

      expect(fetchMock).toHaveBeenCalled();
      const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

      expect(fetchUrl).toEqual(new URL(url));
      expect(fetchInit?.method).toEqual(expectedMethod);
      expect(fetchInit?.body).toEqual(undefined);
      expect(fetchInit?.headers).toEqual(headersSigned);

      const authorization = fetchInit?.headers?.["authorization"];
      expect(authorization).toMatchInlineSnapshot(
        `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=87967143809950c291d1539ed6a88fa6eb19cddbacfdae416db867d73e8fc08b"`,
      );
    });

    it("should fetch with URL", async () => {
      await signedFetch(new URL(url));

      expect(fetchMock).toHaveBeenCalled();
      const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

      expect(fetchUrl).toEqual(new URL(url));
      expect(fetchInit?.method).toEqual(expectedMethod);
      expect(fetchInit?.body).toEqual(undefined);
      expect(fetchInit?.headers).toEqual(headersSigned);

      const authorization = fetchInit?.headers?.["authorization"];
      expect(authorization).toMatchInlineSnapshot(
        `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=87967143809950c291d1539ed6a88fa6eb19cddbacfdae416db867d73e8fc08b"`,
      );
    });

    it("should fetch with Request", async () => {
      await signedFetch(new Request(url));

      expect(fetchMock).toHaveBeenCalled();
      const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

      expect(fetchUrl).toEqual(new URL(url));
      expect(fetchInit?.method).toEqual(expectedMethod);
      expect(fetchInit?.body).toEqual(null);
      expect(fetchInit?.headers).toEqual(headersSigned);

      const authorization = fetchInit?.headers?.["authorization"];
      expect(authorization).toMatchInlineSnapshot(
        `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=87967143809950c291d1539ed6a88fa6eb19cddbacfdae416db867d73e8fc08b"`,
      );
    });

    it("should fetch with Request and options", async () => {
      await signedFetch(new Request(url));

      expect(fetchMock).toHaveBeenCalled();
      const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

      expect(fetchUrl).toEqual(new URL(url));
      expect(fetchInit?.method).toEqual(expectedMethod);
      expect(fetchInit?.body).toEqual(null);
      expect(fetchInit?.headers).toEqual(headersSigned);

      const authorization = fetchInit?.headers?.["authorization"];
      expect(authorization).toMatchInlineSnapshot(
        `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=87967143809950c291d1539ed6a88fa6eb19cddbacfdae416db867d73e8fc08b"`,
      );
    });
  });

  describe("POST", () => {
    describe("Body: undefined", () => {
      const body = undefined;

      it("should fetch with string", async () => {
        await signedFetch(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=c11bdcfcc19e3e5f3f3afdd81a8bf9456650ed6a94803142a92cd432fdacc714"`,
        );
      });

      it("should fetch with URL", async () => {
        await signedFetch(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=c11bdcfcc19e3e5f3f3afdd81a8bf9456650ed6a94803142a92cd432fdacc714"`,
        );
      });

      it("should fetch with Request", async () => {
        await signedFetch(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(null);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=c11bdcfcc19e3e5f3f3afdd81a8bf9456650ed6a94803142a92cd432fdacc714"`,
        );
      });
    });

    describe(`Body: String("foo")`, () => {
      const body = "foo";

      it("should fetch with string", async () => {
        await signedFetch(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=1c6004639bd60c69bfba7f46231d4f25423ae92a8a2746f489bed437273693dc"`,
        );
      });

      it("should fetch with URL", async () => {
        await signedFetch(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=1c6004639bd60c69bfba7f46231d4f25423ae92a8a2746f489bed437273693dc"`,
        );
      });

      it("should fetch with Request", async () => {
        await signedFetch(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=30e1c46ef773fb1a3f82a537e15384d9601aebf38190e9ff03bdb2ff8a8c504f"`,
        );
      });
    });

    describe(`Body: URLSearchParams({ foo: "bar" })`, () => {
      const body = new URLSearchParams({ foo: "bar" });

      it("should fetch with string", async () => {
        await signedFetch(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with URL", async () => {
        await signedFetch(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with Request", async () => {
        await signedFetch(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=783834f3cc782c06f67ca1e74af2defb2cdf7b0e3690e887f5ca6bdee72003e1"`,
        );
      });
    });

    describe(`Body: FormData({ foo: "bar" })`, () => {
      const body = new FormData();
      body.append("foo", "bar");

      it("should fetch with string", async () => {
        await signedFetch(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with URL", async () => {
        await signedFetch(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with Request", async () => {
        // Copied from: https://github.com/nodejs/undici/blob/fb3138d61d652866c54ff78eb182c40fe22f1c5d/test/fetch/formdata.js#L373-L388
        await signedFetch(
          new Request(url, {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data; boundary=----formdata-undici-0.6204674738279623",
            },
            body:
              "------formdata-undici-0.6204674738279623\r\n" +
              'Content-Disposition: form-data; name="fiŝo"\r\n' +
              "\r\n" +
              "value1\r\n" +
              "------formdata-undici-0.6204674738279623--\r\n",
          }),
        );

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=f386b9865153ea2c54b5ece7cff7a3885419a25733e802dea5084b993c1e47d3"`,
        );
      });
    });

    describe(`Body: Blob(["foo"])`, () => {
      const body = new Blob(["foo"]);

      it("should fetch with string", async () => {
        await signedFetch(url, { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with URL", async () => {
        await signedFetch(new URL(url), { method: "POST", body });

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });

      it("should fetch with Request", async () => {
        await signedFetch(new Request(url, { method: "POST", body }));

        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

        expect(fetchUrl).toEqual(new URL(url));
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });
    });

    describe("Body: Uint8Array([0xde, 0xad, 0xbe, 0xef])", () => {
      const body = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      it("should fetch with string", async () => {
        // Arrange
        const expectedUrl = new URL(url);

        // Act
        await signedFetch(url, { method: "POST", body });

        // Assert
        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];
        expect(fetchUrl).toEqual(expectedUrl);
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=f8f04362ccf0b2582c6e4fd9597578d1fcbcd831298cce0adb56adb451f4151d"`,
        );
      });

      it("should fetch with URL", async () => {
        // Arrange
        const expectedUrl = new URL(url);

        // Act
        await signedFetch(new URL(url), { method: "POST", body });

        // Assert
        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];
        expect(fetchUrl).toEqual(expectedUrl);
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(body);
        expect(fetchInit?.headers).toEqual(headersSigned);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=f8f04362ccf0b2582c6e4fd9597578d1fcbcd831298cce0adb56adb451f4151d"`,
        );
      });

      it("should fetch with Request", async () => {
        // Arrange
        const expectedUrl = new URL(url);

        // Act
        await signedFetch(new Request(url, { method: "POST", body }));

        // Assert
        expect(fetchMock).toHaveBeenCalled();
        const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];
        expect(fetchUrl).toEqual(expectedUrl);
        expect(fetchInit?.method).toEqual("POST");
        expect(fetchInit?.body).toEqual(expect.any(ReadableStream));
        expect(fetchInit?.headers).toEqual(headersUnsignedPayload);

        const authorization = fetchInit?.headers?.["authorization"];
        expect(authorization).toMatchInlineSnapshot(
          `"AWS4-HMAC-SHA256 Credential=dummyAccessKeyId/20240101/dummyRegion/dummyService/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=8edb7328e32484357649bb350b9c9d8b95d18c041fc7098ace02a3ab574afc8d"`,
        );
      });
    });
  });
});
