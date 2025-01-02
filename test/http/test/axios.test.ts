import { signRequest } from "aws-sigv4-sign";
import axios from "axios";
import { describe, expect, it } from "vitest";

const SERVICE = "iam";
const REGION = "us-east-1";

describe("axios", () => {
  describe("GET", () => {
    const url = "https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08";

    it("should make request with signed headers", async () => {
      // Arrange
      const signedRequest = await signRequest(url, { service: SERVICE, region: REGION });
      const options = {
        method: signedRequest.method,
        headers: Object.fromEntries(signedRequest.headers.entries()),
      };

      // Act
      const response = await axios(url, options);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.GetUserResponse).toBeDefined();
    });

    it("should fail with unsigned request", async () => {
      // Arrange
      const options = { method: "GET" };

      // Act
      const result = axios(url, options);

      // Assert
      await expect(result).rejects.toThrow();
    });
  });

  describe("POST", () => {
    const url = "https://iam.amazonaws.com/";
    const body = "Action=GetUser&Version=2010-05-08";

    it("should make request with signed headers", async () => {
      // Arrange
      const signedRequest = await signRequest(
        url,
        {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        },
        { service: SERVICE, region: REGION },
      );
      const options = {
        method: signedRequest.method,
        headers: Object.fromEntries(signedRequest.headers.entries()),
        data: body,
      };

      // Act
      const response = await axios(url, options);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.GetUserResponse).toBeDefined();
    });

    it("should fail with unsigned request", async () => {
      // Arrange
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        data: body,
      };

      // Act
      const result = axios(url, options);

      // Assert
      await expect(result).rejects.toThrow();
    });
  });
});
