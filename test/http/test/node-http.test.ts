import { request } from "node:https";
import { signRequest } from "aws-sigv4-sign";
import { describe, expect, it } from "vitest";

const SERVICE = "iam";
const REGION = "us-east-1";

interface NodeHttpResponse {
  status: number;
  statusText?: string;
  data?: string;
}

function httpRequest(url: string, options: Record<string, any>, body?: string): Promise<NodeHttpResponse> {
  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () =>
        resolve({
          status: res.statusCode ?? 0,
          statusText: res.statusMessage,
          data,
        }),
      );
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

describe("node-http", () => {
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
      const response = await httpRequest(url, options);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toContain("<GetUserResult>");
    });

    it("should fail with unsigned request", async () => {
      // Arrange
      const options = { method: "GET" };

      // Act
      const response = await httpRequest(url, options);

      // Assert
      expect(response.status).toBe(403);
      expect(response.statusText).toBe("Forbidden");
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
      };

      // Act
      const response = await httpRequest(url, options, body);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toContain("<GetUserResult>");
    });

    it("should fail with unsigned request", async () => {
      // Arrange
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      };

      // Act
      const response = await httpRequest(url, options, body);

      // Assert
      expect(response.status).toBe(403);
      expect(response.statusText).toBe("Forbidden");
    });
  });
});
