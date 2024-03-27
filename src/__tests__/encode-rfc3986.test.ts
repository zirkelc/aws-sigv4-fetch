import { describe, expect, it } from "vitest";
import { encodeRfc3986 } from "../encode-rfc3986.js";

describe("encodeRfc3986", () => {
	it("should encode reserved characters", () => {
		// * ! ' ( )
		const encoded = encodeRfc3986("* ! ' ( )");
		expect(encoded).toEqual("%2A %21 %27 %28 %29");
	});

	it("should not encode other characters", () => {
		// A–Z a–z 0–9 - _ . ~ ; / ? : @ & = + $ , #
		const str =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- _ . ~ ; / ? : @ & = + $ , #";
		const encoded = encodeRfc3986(str);
		expect(encoded).toEqual(str);
	});
});
