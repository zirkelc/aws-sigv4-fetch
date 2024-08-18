import "cross-fetch/polyfill";
import { describe, expect, it } from "vitest";
import { parseRequest } from "../parse-request.js";

const url = "http://example.com";

describe("parseRequest", () => {
  it("should parse string input", () => {
    expect(parseRequest(url)).toEqual(
      expect.objectContaining({
        url: new URL(url),
        method: "GET",
        headers: {},
        body: undefined,
      }),
    );
  });

  it("should parse URL input", () => {
    expect(parseRequest(new URL(url))).toEqual(
      expect.objectContaining({
        url: new URL(url),
        method: "GET",
        headers: {},
        body: undefined,
      }),
    );
  });

  it("should parse Request input", () => {
    expect(parseRequest(new Request(url))).toEqual(
      expect.objectContaining({
        url: new URL(url),
        method: "GET",
        headers: {},
        body: null, // added by Request
      }),
    );

    expect(
      parseRequest(
        new Request(url, {
          method: "POST",
          body: "foo",
          headers: { header1: "value1", header2: "value2" },
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        url: new URL(url),
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8", // added by Request
          header1: "value1",
          header2: "value2",
        },
        body: expect.any(ReadableStream), // added by Request
      }),
    );
  });

  describe("should override options from RequestInit", () => {
    it("should override method", () => {
      expect(
        parseRequest(new Request(url, { method: "GET" }), {
          method: "POST",
        }),
      ).toEqual(
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should override body", () => {
      expect(
        parseRequest(new Request(url, { method: "POST", body: "foo" }), {
          body: "bar",
        }),
      ).toEqual(
        expect.objectContaining({
          body: "bar",
        }),
      );
    });

    it("should override headers", () => {
      expect(
        parseRequest(
          new Request(url, {
            headers: { header1: "value1", header2: "value2" },
          }),
          {
            headers: { header3: "value3", header4: "value4" },
          },
        ),
      ).toEqual(
        expect.objectContaining({
          headers: {
            header3: "value3",
            header4: "value4",
          },
        }),
      );

      expect(
        parseRequest(
          new Request(url, {
            headers: { header1: "value1", header2: "value2" },
          }),
          {
            headers: [
              ["header3", "value3"],
              ["header4", "value4"],
            ],
          },
        ),
      ).toEqual(
        expect.objectContaining({
          headers: {
            header3: "value3",
            header4: "value4",
          },
        }),
      );

      expect(
        parseRequest(
          new Request(url, {
            headers: { header1: "value1", header2: "value2" },
          }),
          {
            headers: new Headers({
              header3: "value3",
              header4: "value4",
            }),
          },
        ),
      ).toEqual(
        expect.objectContaining({
          headers: {
            header3: "value3",
            header4: "value4",
          },
        }),
      );
    });
  });

  it("should uppercase method", () => {
    expect(parseRequest(url, { method: "get" })).toEqual(
      expect.objectContaining({
        method: "GET",
      }),
    );

    expect(parseRequest(new Request(url, { method: "post" }))).toEqual(
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("should throw error if input is invalid", () => {
    expect(() => parseRequest("")).toThrowError();
    expect(() => parseRequest(null as any)).toThrowError();
    expect(() => parseRequest(undefined as any)).toThrowError();
    expect(() => parseRequest({} as any)).toThrowError();
  });
});
