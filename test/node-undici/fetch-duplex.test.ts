import { Request as UndiciRequest } from "undici";
import { describe, expect, it } from "vitest";
import { createSignedFetcher, signRequest } from "../../dist/index.js";

const url = "https://example.com/";
const init = () => ({ method: "POST", body: new ReadableStream() });

// Create a helper function to create a stream from a string
function createReadableStreamFromString(content: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    },
  });
}

describe("createSignedFetcher", () => {
  it.fails("should fail without duplex", async () => {
    const request = new UndiciRequest(url, init());

    const fetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
    const response = await fetch(request as Request);

    expect(response.status).toBe(200);
  });

  it.only("should succeed with duplex", async () => {
    const request = new UndiciRequest("https://iam.amazonaws.com", {
      method: "POST",
      body: createReadableStreamFromString("Action=GetUser&Version=2010-05-08"),
      duplex: "half",
    });
    // const response2 = await fetch(request as Request);
    // expect(response2.status).toBe(200);

    const signedFetch = createSignedFetcher({ service: "iam", region: "us-east-1" });
    const response = await signedFetch(request as Request);

    expect(response.status).toBe(200);
  });
}, 100_000);

describe("signRequest", () => {
  it.fails("should fail without duplex", async () => {
    const request = new UndiciRequest(url, init());

    const signedRequest = await signRequest(request as Request, { service: "iam", region: "us-east-1" });
    const response = await fetch(signedRequest);

    expect(response.status).toBe(200);
  });

  it("should succeed with duplex", async () => {
    const request = new UndiciRequest(url, { ...init(), duplex: "half" });

    const signedRequest = await signRequest(request as Request, { service: "iam", region: "us-east-1" });
    const response = await fetch(signedRequest);

    expect(response.status).toBe(200);
  });
});
