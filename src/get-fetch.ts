export const getFetchFn = (customFetchFn?: typeof fetch): typeof fetch => {
	if (customFetchFn) {
		return customFetchFn;
	}

	if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
		return window.fetch; // TODO bind?
	}

	if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
		return globalThis.fetch; // TODO bind?
	}

	throw new Error('No fetch implementation found');
};