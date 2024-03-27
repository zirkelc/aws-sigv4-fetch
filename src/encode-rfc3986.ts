/**
 * Encodes a string according to RFC 3986.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986 | MDN}
 */
export const encodeRfc3986 = (str: string): string => {
	return str.replace(
		/[!'()*]/g,
		(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
	);
};
