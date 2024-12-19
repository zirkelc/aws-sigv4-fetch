import type { AwsCredentialIdentity } from "@aws-sdk/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedFetcher } from "../create-signed-fetcher.js";
import { type SignRequestOptions, signRequest } from "../sign-request.js";

vi.useFakeTimers();
vi.setSystemTime("2000-01-01T00:00:00.000Z");

const credentials: AwsCredentialIdentity = {
  accessKeyId: "foo",
  secretAccessKey: "bar",
};

const options: SignRequestOptions = {
  service: "foo",
  region: "us-bar-1",
  credentials,
};

beforeEach(() => {
  vi.resetAllMocks();
});

const url = "https://foo.us-bar-1.amazonaws.com/";

const headersSigned = expect.objectContaining({
  host: "foo.us-bar-1.amazonaws.com",
  "x-amz-date": "20000101T000000Z",
  "x-amz-content-sha256": expect.stringMatching(/^[a-f0-9]{64}$/),
  authorization: expect.stringMatching(
    /AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/,
  ),
});

const headersUnsignedPayload = expect.objectContaining({
  host: "foo.us-bar-1.amazonaws.com",
  "x-amz-date": "20000101T000000Z",
  "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
  authorization: expect.stringMatching(
    /AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/,
  ),
});

const getSignedHeaders = (
  signedRequest: Request,
): Record<"authorization" | "host" | "x-amz-content-sha256" | "x-amz-date" | "x-amz-security-token", string> => {
  const headers: Record<string, string> = {};
  signedRequest.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
};

describe("signRequest", () => {
  describe("GET", () => {
    it("should fetch with string", async () => {
      const signedRequest = await signRequest(url, options);

      expect(signedRequest.url).toEqual(url);
      expect(signedRequest.method).toEqual("GET");
      expect(signedRequest.body).toEqual(null);

      const signedHeaders = getSignedHeaders(signedRequest);
      expect(signedHeaders).toEqual(headersSigned);

      const authorization = signedHeaders.authorization;
      expect(authorization).toBe(
        "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=aa773e14e7b0ff9b9c7434ba0fd3b91e16a7707f95875e96ff387c1f4c7094e7",
      );
    });

    it("should fetch with URL", async () => {
      const signedRequest = await signRequest(new URL(url), options);

      expect(signedRequest.url).toEqual(url);
      expect(signedRequest.method).toEqual("GET");
      expect(signedRequest.body).toEqual(null);

      const signedHeaders = getSignedHeaders(signedRequest);
      expect(signedHeaders).toEqual(headersSigned);
      expect(signedHeaders.authorization).toBe(
        "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=aa773e14e7b0ff9b9c7434ba0fd3b91e16a7707f95875e96ff387c1f4c7094e7",
      );
    });

    it("should fetch with Request", async () => {
      const signedRequest = await signRequest(new Request(url), options);

      expect(signedRequest.url).toEqual(url);
      expect(signedRequest.method).toEqual("GET");
      expect(signedRequest.body).toEqual(null);

      const signedHeaders = getSignedHeaders(signedRequest);
      expect(signedHeaders).toEqual(headersSigned);
      expect(signedHeaders.authorization).toBe(
        "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=aa773e14e7b0ff9b9c7434ba0fd3b91e16a7707f95875e96ff387c1f4c7094e7",
      );
    });
  });

  describe("POST", () => {
    describe("Body: undefined", () => {
      const body = undefined;

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");
        expect(signedRequest.body).toEqual(null);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);

        const authorization = signedHeaders.authorization;
        expect(authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=1e3b24fcfd7655c0c245d99ba7b6b5ca6174eab903ebfbda09ce457af062ad30",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");
        expect(signedRequest.body).toEqual(null);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=1e3b24fcfd7655c0c245d99ba7b6b5ca6174eab903ebfbda09ce457af062ad30",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", body }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");
        expect(signedRequest.body).toEqual(null);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=1e3b24fcfd7655c0c245d99ba7b6b5ca6174eab903ebfbda09ce457af062ad30",
        );
      });
    });

    describe("Body: string", () => {
      const body = "It was the best of times, it was the worst of times";

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);

        const authorization = signedHeaders.authorization;
        expect(authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=3669d63039ee68092095433425d2cebeac18afe80260a4b2f983694647e87a66",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=3669d63039ee68092095433425d2cebeac18afe80260a4b2f983694647e87a66",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", body }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=3669d63039ee68092095433425d2cebeac18afe80260a4b2f983694647e87a66",
        );
      });
    });

    describe("Body: URLSearchParams", () => {
      const body = new URLSearchParams({ foo: "bar" });

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body.toString());

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=a2b8d86879c46ff096f7b7d021a410fe09697269f0630ac31bdd7640e62d4bdb",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body.toString());

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=a2b8d86879c46ff096f7b7d021a410fe09697269f0630ac31bdd7640e62d4bdb",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", body }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const text = await signedRequest.text();
        expect(text).toEqual(body.toString());

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=a2b8d86879c46ff096f7b7d021a410fe09697269f0630ac31bdd7640e62d4bdb",
        );
      });
    });

    describe("Body: FormData", () => {
      const body = new FormData();
      body.append("foo", "bar");

      /**
       * Undici generates a random boundary for each request.
       */
      const serializedFormData = {
        headers: {
          "Content-Type": "multipart/form-data; boundary=----formdata-undici-0.6204674738279623",
        },
        body:
          "------formdata-undici-0.6204674738279623\r\n" +
          'Content-Disposition: form-data; name="foo"\r\n' +
          "\r\n" +
          "bar\r\n" +
          "------formdata-undici-0.6204674738279623--\r\n",
      };

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", ...serializedFormData }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const formData = await signedRequest.formData();
        expect(formData).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=49b9a46b57b6877323d917ebc6fa3ff0c521d9a3a512f3419ae35ded4f8f58a2",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", ...serializedFormData }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const formData = await signedRequest.formData();
        expect(formData).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=49b9a46b57b6877323d917ebc6fa3ff0c521d9a3a512f3419ae35ded4f8f58a2",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", ...serializedFormData }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const formData = await signedRequest.formData();
        expect(formData).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=49b9a46b57b6877323d917ebc6fa3ff0c521d9a3a512f3419ae35ded4f8f58a2",
        );
      });
    });

    describe("Body: Blob", () => {
      const body = new Blob(["foo"], { type: "text/plain" });

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const blob = await signedRequest.blob();
        expect(blob).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=5cee677704af2119be87adfacf459bf03081418a4badb22c91bd37bba8d2bf90",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const blob = await signedRequest.blob();
        expect(blob).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=5cee677704af2119be87adfacf459bf03081418a4badb22c91bd37bba8d2bf90",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", body }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const blob = await signedRequest.blob();
        expect(blob).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);

        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=5cee677704af2119be87adfacf459bf03081418a4badb22c91bd37bba8d2bf90",
        );
      });
    });

    describe("Body: Uint8Array", () => {
      const body = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      it("should fetch with string", async () => {
        const signedRequest = await signRequest(url, { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const arrayBuffer = await signedRequest.arrayBuffer();
        expect(new Uint8Array(arrayBuffer)).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=89f092f52faedb8a6be1890b2a511b88e7998389d62bd7d72915e2f4ee271a64",
        );
      });

      it("should fetch with URL", async () => {
        const signedRequest = await signRequest(new URL(url), { method: "POST", body }, options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const arrayBuffer = await signedRequest.arrayBuffer();
        expect(new Uint8Array(arrayBuffer)).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);
        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=89f092f52faedb8a6be1890b2a511b88e7998389d62bd7d72915e2f4ee271a64",
        );
      });

      it("should fetch with Request", async () => {
        const signedRequest = await signRequest(new Request(url, { method: "POST", body }), options);

        expect(signedRequest.url).toEqual(url);
        expect(signedRequest.method).toEqual("POST");

        const arrayBuffer = await signedRequest.arrayBuffer();
        expect(new Uint8Array(arrayBuffer)).toEqual(body);

        const signedHeaders = getSignedHeaders(signedRequest);
        expect(signedHeaders).toEqual(headersSigned);

        expect(signedHeaders.authorization).toBe(
          "AWS4-HMAC-SHA256 Credential=foo/20000101/us-bar-1/foo/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=89f092f52faedb8a6be1890b2a511b88e7998389d62bd7d72915e2f4ee271a64",
        );
      });
    });
  });
});
