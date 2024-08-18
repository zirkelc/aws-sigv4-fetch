import "cross-fetch/polyfill";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createSignedFetcher } from "../../src/index.js";

const SERVICE = "iam";
const REGION = "us-east-1";

let signedFetch: typeof fetch;

beforeAll(() => {});

beforeEach(() => {
	signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });
});

describe("IAM", () => {
	describe("GET", () => {
		const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

		it("should fetch with string", async () => {
			const response = await signedFetch(url);
			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain("<GetUserResult>");
		});

		it("should fetch with URL", async () => {
			const response = await signedFetch(new URL(url));
			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain("<GetUserResult>");
		});

		it("should fetch with Request", async () => {
			const response = await signedFetch(new Request(url));
			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain("<GetUserResult>");
		});

		it("should fetch with additional headers", async () => {
			const response = await signedFetch(url, {
				method: "GET",
				headers: {
					"x-amz-test-header": "test-value",
					"x-api-key": "test-api-key",
				},
			});

			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain("<GetUserResult>");
		});

		it("should abort request", async () => {
			const controller = new AbortController();
			const signal = controller.signal;

			const response = signedFetch(url, {
				method: "GET",
				signal,
			});

			controller.abort();

			await expect(response).rejects.toThrow();
		});

		it("should throw an error for unsigned fetch", async () => {
			const response = await fetch(url, {
				method: "GET",
			});

			expect(response.status).toBe(403);
			expect(response.statusText).toBe("Forbidden");
		});
	});

	describe("POST", () => {
		const url = "https://iam.amazonaws.com/";
		const bodies = ["Action=GetUser&Version=2010-05-08"];

		describe.each(bodies)("Body: %s", (body) => {
			it("should fetch with string", async () => {
				const response = await signedFetch(url, {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
					},
				});
				expect(response.status).toBe(200);

				const data = await response.text();
				expect(data).toContain("<GetUserResult>");
			});

			it("should fetch with URL", async () => {
				const response = await signedFetch(new URL(url), {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
					},
				});
				expect(response.status).toBe(200);

				const data = await response.text();
				expect(data).toContain("<GetUserResult>");
			});

			it("should fetch with Request", async () => {
				const response = await signedFetch(new Request(url), {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
					},
				});
				expect(response.status).toBe(200);

				const data = await response.text();
				expect(data).toContain("<GetUserResult>");
			});

			it("should fetch with additional headers", async () => {
				const response = await signedFetch(url, {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
						"x-amz-test-header": "test-value",
						"x-api-key": "test-api-key",
					},
				});

				expect(response.status).toBe(200);

				const data = await response.text();
				expect(data).toContain("<GetUserResult>");
			});

			it("should abort request", async () => {
				const controller = new AbortController();
				const signal = controller.signal;

				const response = signedFetch(url, {
					method: "POST",
					signal,
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
					},
				});

				controller.abort();

				await expect(response).rejects.toThrow();
			});

			it("should throw an error for unsigned fetch", async () => {
				const response = await fetch(url, {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
					},
				});

				expect(response.status).toBe(403);
				expect(response.statusText).toBe("Forbidden");
			});
		});
	});
});
