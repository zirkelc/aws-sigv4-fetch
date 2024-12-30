import { GetFunctionUrlConfigCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { describe, expect, it } from "vitest";
import { createSignedFetcher } from "../../dist/index.js";
import { FUNCTION_NAME, REGION, RESPONSE, SERVICE } from "../lib/lambda-test-stack.js";

const client = new LambdaClient({ region: REGION });
const response = await client.send(new GetFunctionUrlConfigCommand({ FunctionName: FUNCTION_NAME }));
if (!response.FunctionUrl) throw new Error("Function URL not found");

const functionUrl = response.FunctionUrl;
console.log("Function URL:", functionUrl);

const paths = ["", "/foo", "/foo-bar"];

describe("Lambda Function URL", () => {
  describe("GET", () => {
    describe.each(paths)("Path: %s", (path) => {
      const url = `${functionUrl}${path}`;

      it("should fetch with string", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(url, {
          method: "GET",
        });

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(RESPONSE);
      });

      it("should fetch with URL", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(new URL(url));

        // Assert
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual(RESPONSE);
      });

      it("should fetch with Request", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(new Request(url));

        // Assert
        expect(response.status).toBe(200);
      });

      it("should throw an error for unsigned fetch", async () => {
        // Arrange

        // Act
        const response = await fetch(url, {
          method: "GET",
        });

        // Assert
        expect(response.status).toBe(403);
        expect(response.statusText).toBe("Forbidden");
      });
    });
  });

  describe("POST", () => {
    describe.each(paths)("Path: %s", (path) => {
      const url = `${functionUrl}${path}`;

      it("should fetch with string", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(url, {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(RESPONSE);
      });

      it("should fetch with URL", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(new URL(url));

        // Assert
        expect(response.status).toBe(200);
      });

      it("should fetch with Request", async () => {
        // Arrange
        const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

        // Act
        const response = await signedFetch(new Request(url));

        // Assert
        expect(response.status).toBe(200);
      });

      it("should throw an error for unsigned fetch", async () => {
        // Arrange

        // Act
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Assert
        expect(response.status).toBe(403);
        expect(response.statusText).toBe("Forbidden");
      });
    });
  });
});
