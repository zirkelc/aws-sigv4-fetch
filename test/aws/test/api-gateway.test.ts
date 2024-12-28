import { APIGatewayClient, GetRestApisCommand } from "@aws-sdk/client-api-gateway";
import { describe, expect, it } from "vitest";
import { createSignedFetcher } from "../../dist/index.js";
import { API_NAME, REGION, RESOURCE, RESPONSE, SERVICE, STAGE } from "../lib/api-gateway-test-stack.js";

const client = new APIGatewayClient({ region: REGION });
const response = await client.send(new GetRestApisCommand({}));
const api = response.items?.find((api) => api.name === API_NAME);
if (!api) throw new Error("API not found");

const restApiId = api.id;

const apiRootUrl = `https://${restApiId}.execute-api.${REGION}.amazonaws.com/${STAGE}`;
console.log("API URL:", apiRootUrl);

const paths = [`/${RESOURCE}`, `/${RESOURCE}/foo`, `/${RESOURCE}/foo-*`];

describe("APIGateway", () => {
  describe("GET", () => {
    describe.each(paths)("Path: %s", async (path) => {
      const url = `${apiRootUrl}${path}`;

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

        const data = await response.json();
        expect(data).toEqual(RESPONSE);
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
    describe.each(paths)("Path: %s", async (path) => {
      const url = `${apiRootUrl}${path}`;

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

        const data = await response.json();
        expect(data).toEqual(RESPONSE);
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
