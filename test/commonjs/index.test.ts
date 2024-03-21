import "cross-fetch/polyfill";
import { expect, test } from "vitest";
import { createSignedFetcher } from "../../dist/index.cjs";

test("should fetch", async () => {
	const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

	const fetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
	const response = await fetch(url);

	expect(response.status).toBe(200);

	const data = await response.text();
	expect(data).toContain("<GetUserResult>");
});
