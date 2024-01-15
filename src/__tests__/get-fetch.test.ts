import { afterEach, describe, expect, it, vi } from "vitest";
import { getFetchFn } from "../get-fetch";

describe("getFetchFn", () => {
	// Set up a global fetch mock
	const fetchMock = vi.fn();
	globalThis.fetch = fetchMock;

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns custom fetch function if provided", () => {
		const customFetchFn = vi.fn();
		expect(getFetchFn(customFetchFn)).toBe(customFetchFn);
	});

	it("returns bound window.fetch if no custom fetch function is provided and window is defined", () => {
		const windowFetchMock = vi.fn();
		const spy = vi.spyOn(windowFetchMock as any, "bind");
		// @ts-ignore
		global.window = { fetch: windowFetchMock };

		getFetchFn();
		expect(spy).toHaveBeenCalledWith(window);

		// @ts-ignore
		global.window = undefined;
	});

	it("returns bound globalThis.fetch if no custom fetch function is provided, window is not defined, and globalThis is defined", () => {
		const spy = vi.spyOn(fetchMock as any, "bind");

		getFetchFn();
		expect(spy).toHaveBeenCalledWith(globalThis);
	});

	it("throws an error if no fetch implementation is found", () => {
		// @ts-ignore
		global.fetch = undefined;
		// @ts-ignore
		global.window = undefined;
		// @ts-ignore
		globalThis.fetch = undefined;

		expect(() => getFetchFn()).toThrow("No fetch implementation found");
	});
});
