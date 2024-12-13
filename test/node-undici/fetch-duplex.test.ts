import "cross-fetch/polyfill";
import { Request as UndiciRequest } from "undici";
import { expect, it } from "vitest";
import { createSignedFetcher } from "../../dist/index.js";

it.fails("should fail without duplex", async () => {
  const request = new UndiciRequest("http://example.com", { method: "POST", body: new ReadableStream() });

  const fetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
  const response = await fetch(request as Request);

  expect(response.status).toBe(200);
});
