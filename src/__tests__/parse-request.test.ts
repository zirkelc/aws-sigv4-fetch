import "cross-fetch/polyfill";
import { Request as UndiciRequest, type RequestInit as UndiciRequestInit } from "undici";
import { describe, expect, it } from "vitest";
import { parseRequest } from "../parse-request.js";

const url = "http://example.com";

describe("parseRequest", () => {
  describe("string input", () => {
    it("should parse `string` input", () => {
      // Arrange
      const input = url;

      // Act
      const parsed = parseRequest(input);

      // Assert
      expect(parsed.url).toEqual(new URL(url));
      expect(parsed.method).toEqual("GET");
      expect(parsed.headers).toEqual({});
    });
  });

  describe("URL input", () => {
    it("should parse `URL` input", () => {
      // Arrange
      const input = new URL(url);

      // Act
      const parsed = parseRequest(input);

      // Assert
      expect(parsed.url).toEqual(new URL(url));
      expect(parsed.method).toEqual("GET");
      expect(parsed.headers).toEqual({});
    });
  });

  describe("Request input", () => {
    it("should parse simple `Request` input", () => {
      // Arrange
      const simpleRequest = new Request(url);

      // Act
      const parsed = parseRequest(simpleRequest);

      // Assert
      expect(parsed.url).toEqual(new URL(url));
      expect(parsed.method).toEqual("GET");
      expect(parsed.headers).toEqual({});
      expect(parsed.body).toBeNull();
    });

    it("should parse complex `Request` input", () => {
      // Arrange
      const complexRequest = new Request(url, {
        method: "POST",
        body: "foo",
        headers: { header1: "value1", header2: "value2" },
      });

      // Act
      const parsedComplex = parseRequest(complexRequest);

      // Assert
      expect(parsedComplex.url).toEqual(new URL(url));
      expect(parsedComplex.method).toEqual("POST");
      expect(parsedComplex.headers).toEqual({
        "content-type": "text/plain;charset=UTF-8",
        header1: "value1",
        header2: "value2",
      });
      expect(parsedComplex.body).toBeInstanceOf(ReadableStream);
    });
  });

  describe("body", () => {
    it("should parse body of `Request`", () => {
      // Arrange
      const input = new Request(url, { method: "POST", body: "foo" });

      // Act
      const parsed = parseRequest(input);

      // Assert
      expect(parsed.body).toBeInstanceOf(ReadableStream);
    });

    it("should parse body of `RequestInit`", () => {
      // Arrange
      const init = { body: "foo" };

      // Act
      const parsed = parseRequest(url, init);

      // Assert
      expect(parsed.body).toEqual("foo");
    });

    it("should override body of `Request` from `RequestInit`", () => {
      // Arrange
      const input = new Request(url, { method: "POST", body: "foo" });
      const init = { body: "bar" };

      // Act
      const parsed = parseRequest(input, init);

      // Assert
      expect(parsed.body).toEqual("bar");
    });
  });

  describe("Node.js options ", () => {
    it("should keep duplex from `Request`", () => {
      // Arrange
      const input = new UndiciRequest(url, { method: "POST", body: "foo", duplex: "half" });

      // Act
      const parsed = parseRequest(input as Request);

      // Assert
      expect((parsed as any).duplex).toEqual("half");
    });

    it("should keep duplex from `RequestInit`", () => {
      // Arrange
      const input = new UndiciRequest(url, { method: "POST", body: "foo" });
      const init = { duplex: "half" } as UndiciRequestInit;

      // Act
      const parsed = parseRequest(input as Request, init as RequestInit);

      // Assert
      expect((parsed as any).duplex).toEqual("half");
    });
  });

  describe("headers", () => {
    it("should parse `Headers` to plain object", () => {
      // Arrange
      const headers = new Headers({ header1: "value1", header2: "value2" });

      // Act
      const parsed = parseRequest(url, { headers });

      // Assert
      expect(parsed.headers).toEqual({
        header1: "value1",
        header2: "value2",
      });
    });

    it("should parse `HeadersInit` to plain object", () => {
      // Arrange
      const init = { headers: { header1: "value1", header2: "value2" } as HeadersInit };

      // Act
      const parsed = parseRequest(url, init);

      // Assert
      expect(parsed.headers).toEqual({ header1: "value1", header2: "value2" });
    });

    it("should parse array of headers to plain object", () => {
      // Arrange
      const init = {
        headers: [
          ["header1", "value1"],
          ["header2", "value2"],
        ] as [string, string][],
      };

      // Act
      const parsed = parseRequest(url, init);

      // Assert
      expect(parsed.headers).toEqual({ header1: "value1", header2: "value2" });
    });

    it("should override headers of `Request` from `RequestInit`", () => {
      // Arrange
      const input = new Request(url, {
        headers: { header1: "value1", header2: "value2" },
      });
      const init = {
        headers: { header3: "value3", header4: "value4" },
      };

      // Act
      const parsed = parseRequest(input, init);

      // Assert
      expect(parsed.headers).toEqual({
        header3: "value3",
        header4: "value4",
      });
    });
  });

  describe("method", () => {
    it("should set default method to GET", () => {
      // Arrange
      const input = url;

      // Act
      const parsed = parseRequest(input);

      // Assert
      expect(parsed.method).toEqual("GET");
    });

    it("should override method of `Request` from `RequestInit`", () => {
      // Arrange
      const input = new Request(url, { method: "GET" });
      const init = { method: "POST" };

      // Act
      const parsed = parseRequest(input, init);

      // Assert
      expect(parsed.method).toEqual("POST");
    });

    it("should uppercase method from `Request`", () => {
      // Arrange
      const input = new Request(url, { method: "post" });

      // Act
      const parsed = parseRequest(input);

      // Assert
      expect(parsed.method).toEqual("POST");
    });

    it("should uppercase method from `RequestInit`", () => {
      // Arrange
      const init = { method: "get" };

      // Act
      const parsed = parseRequest(url, init);

      // Assert
      expect(parsed.method).toEqual("GET");
    });
  });

  it("should throw error if input is invalid", () => {
    // Assert
    expect(() => parseRequest("")).toThrow();
    expect(() => parseRequest(null as any)).toThrow();
    expect(() => parseRequest(undefined as any)).toThrow();
    expect(() => parseRequest({} as any)).toThrow();
  });
});
