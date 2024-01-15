import { describe, expect, it, vi } from "vitest";
import { createSignedFetcher } from "../create-signed-fetcher";

describe("createSignedFetcher", () => {
	it("should create a signed fetcher", async () => {
		const fetchMock = vi.fn();

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

		const url = "http://test.com";
		const init = {
			method: "GET",
			body: "mocked-body",
		};

		await fetcher(url, init);

		expect(fetchMock).toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledWith(
			url,
			expect.objectContaining({
				method: init.method,
				body: init.body,
				headers: expect.any(Object),
			}),
		);

		const headers = fetchMock.mock.calls[0][1].headers;
		expect(headers["host"]).toEqual("test.com");
		expect(headers["x-amz-date"]).toMatch(/\d{8}T\d{6}Z/);
		expect(headers["x-amz-security-token"]).toEqual("dummySessionToken");
		expect(headers["x-amz-content-sha256"]).toMatch(/^[a-f0-9]{64}$/);
		expect(headers["authorization"]).toMatch(
			/AWS4-HMAC-SHA256 Credential=([a-zA-Z0-9]+)\/(\d{8})\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/aws4_request, SignedHeaders=([a-zA-Z0-9;-]+), Signature=([a-fA-F0-9]{64})/g,
		);
	});
});
