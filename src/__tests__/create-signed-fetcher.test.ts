import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedFetcher } from "../create-signed-fetcher.js";

const urls = [
	"http://test.com",
	"http://test.com/foo",
	"http://test.com/foo?bar=baz",
	"http://test.com/foo?bar=baz#qux",
];

const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];

const formData = new FormData();
formData.append("foo", "bar");

const bodies = [
	undefined,
	"foo",
	// TODO add Blob | BufferSource | FormData | URLSearchParams
	// new URLSearchParams({ bar: "baz" }),
	// formData,
];

beforeEach(() => {
	vi.resetAllMocks();
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

	it.each(urls.map((url) => ({ url })))(
		"should fetch url: $url",
		async ({ url }) => {
			await fetcher(url);

			expect(fetchMock).toHaveBeenCalled();
			const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

			expect(fetchUrl).toEqual(url);
			expect(fetchInit.method).toEqual("GET");
			expect(fetchInit.body).toEqual(undefined);
			expect(fetchInit.headers).toEqual(expect.any(Object));

			const headers = fetchInit.headers;
			expect(headers["host"]).toEqual("test.com");
			expect(headers["x-amz-date"]).toMatch(/\d{8}T\d{6}Z/);
			expect(headers["x-amz-security-token"]).toEqual("dummySessionToken");
			expect(headers["x-amz-content-sha256"]).toMatch(/^[a-f0-9]{64}$/);
			expect(headers["authorization"]).toMatch(
				/AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/g,
			);
		},
	);

	it.each(methods)("should fetch url with method: %s", async (method) => {
		const url = "http://test.com";
		const init = { method };
		await fetcher(url, init);

		expect(fetchMock).toHaveBeenCalled();
		const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

		expect(fetchUrl).toEqual(url);
		expect(fetchInit.method).toEqual(init.method);
		expect(fetchInit.body).toEqual(undefined);
		expect(fetchInit.headers).toEqual(expect.any(Object));

		const headers = fetchInit.headers;
		expect(headers["host"]).toEqual("test.com");
		expect(headers["x-amz-date"]).toMatch(/\d{8}T\d{6}Z/);
		expect(headers["x-amz-security-token"]).toEqual("dummySessionToken");
		expect(headers["x-amz-content-sha256"]).toMatch(/^[a-f0-9]{64}$/);
		expect(headers["authorization"]).toMatch(
			/AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/g,
		);
	});

	it.each(bodies)("should fetch url with body: %s", async (body) => {
		const url = "http://test.com";
		const init = { method: "POST", body };
		await fetcher(url, init);

		expect(fetchMock).toHaveBeenCalled();
		const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];

		expect(fetchUrl).toEqual(url);
		expect(fetchInit.method).toEqual(init.method);
		expect(fetchInit.body).toEqual(body);
		expect(fetchInit.headers).toEqual(expect.any(Object));

		const headers = fetchInit.headers;
		expect(headers["host"]).toEqual("test.com");
		expect(headers["x-amz-date"]).toMatch(/\d{8}T\d{6}Z/);
		expect(headers["x-amz-security-token"]).toEqual("dummySessionToken");
		expect(headers["x-amz-content-sha256"]).toMatch(/^[a-f0-9]{64}$/);
		expect(headers["authorization"]).toMatch(
			/AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/g,
		);
	});
});
