import "cross-fetch/polyfill";
import { describe, expect, it } from "vitest";
import { createSignedFetcher } from "../dist/index";

describe("IAM", () => {
	it("should handle GET", async () => {
		const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

		const fetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
		const response = await fetch(url, {
			method: "GET",
		});

		expect(response.status).toBe(200);

		const data = await response.text();
		expect(data).toContain("<GetUserResult>");
	});

	it("should handle POST", async () => {
		const url = "https://iam.amazonaws.com/";
		const body = "Action=GetUser&Version=2010-05-08";

		const fetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
		const response = await fetch(url, {
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

	it("should handle additional headers", async () => {
		const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

		const headers = {
			"x-amz-test-header": "test-value",
			"x-api-key": "test-api-key",
		};

		const fetch = createSignedFetcher({
			service: "iam",
			region: "us-east-1",
		});

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		expect(response.status).toBe(200);

		const data = await response.text();
		expect(data).toContain("<GetUserResult>");
	});

	it("should handle url fragments", async () => {
		const url =
			"https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08#test-fragment";

		const fetch = createSignedFetcher({
			service: "iam",
			region: "us-east-1",
		});

		const response = await fetch(url, {
			method: "GET",
		});

		expect(response.status).toBe(200);

		const data = await response.text();
		expect(data).toContain("<GetUserResult>");
	});

	it("should abort request", async () => {
		const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

		const controller = new AbortController();
		const signal = controller.signal;

		const fetch = createSignedFetcher({
			service: "iam",
			region: "us-east-1",
		});

		const response = fetch(url, {
			method: "GET",
			signal,
		});

		controller.abort();

		await expect(response).rejects.toThrow("This operation was aborted");
	});
});
