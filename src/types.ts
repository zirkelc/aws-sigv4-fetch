/// <reference lib="dom" />
import type { Credentials, Provider } from "@aws-sdk/types";

// export type Fetch = typeof fetch | ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>);

export type SignedFetcherOptions = {
	service: string;
	region?: string;
	credentials?: Credentials | Provider<Credentials>;
	fetch?: typeof fetch;
}

export type CreateSignedFetcher = (init: SignedFetcherOptions) => typeof fetch;
