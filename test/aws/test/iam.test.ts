import "cross-fetch/polyfill";
import { describe, expect, it } from "vitest";
import { createSignedFetcher } from "../../dist/index.js";

const SERVICE = "iam";
const REGION = "us-east-1";

describe("IAM", () => {
  describe("GET", () => {
    const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

    it("should fetch with string", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(url);

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should fetch with URL", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(new URL(url));

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should fetch with Request", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(new Request(url));

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should fetch with additional headers", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(url, {
        method: "GET",
        headers: {
          "x-amz-test-header": "test-value",
          "x-api-key": "test-api-key",
        },
      });

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should abort request", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });
      const controller = new AbortController();
      const signal = controller.signal;

      // Act
      const response = signedFetch(url, {
        method: "GET",
        signal,
      });

      controller.abort();

      // Assert
      await expect(response).rejects.toThrow();
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

  describe("POST", () => {
    const url = "https://iam.amazonaws.com/";
    const body = "Action=GetUser&Version=2010-05-08";

    it("should fetch with string", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(url, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should fetch with URL", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(new URL(url), {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should fetch with Request", async () => {
      // Arrange
      const signedFetch = createSignedFetcher({ service: SERVICE, region: REGION });

      // Act
      const response = await signedFetch(new Request(url), {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });

      // Assert
      expect(response.status).toBe(200);

      const data = await response.text();
      expect(data).toContain("<GetUserResult>");
    });

    it("should throw an error for unsigned fetch", async () => {
      // Arrange

      // Act
      const response = await fetch(url, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });

      // Assert
      expect(response.status).toBe(403);
      expect(response.statusText).toBe("Forbidden");
    });
  });
});
