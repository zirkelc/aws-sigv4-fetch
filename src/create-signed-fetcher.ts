import { SignatureV4 } from '@aws-sdk/signature-v4';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
// import fetch, { Headers } from 'cross-fetch';
// import { Credentials, Provider, QueryParameterBag } from "@aws-sdk/types";
import { parseQueryString } from '@aws-sdk/querystring-parser';
import { getFetchFn } from './get-fetch';
import { CreateSignedFetcher, SignedFetcherOptions } from './types';
import { getHeaders } from './get-headers';

// TODO
// export types
// publish as cjs and esm
// add github actions tets with ddb 
// add units tests
// chnage jest to use ts-jest

/**
 * Create a signed fetch function that automatically signs requests with AWS Signature V4.
 * Service and region must be provided. Credentials can be provided if you want to sign requests with a specific set of credentials. 
 * If no credentials are provided, the default credentials from `@aws-sdk/credential-provider-node` will be used.
 * See: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/request-signing.html#request-signing-node
 * @param init 
 * @returns fetch
 */
export const createSignedFetcher: CreateSignedFetcher = (opts: SignedFetcherOptions): typeof fetch => {
	const { service, region = 'us-east-1', credentials } = opts;
	const fetchFn = getFetchFn(opts.fetch);

	return async (input, init?) => {
		const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);

		const headers = getHeaders(init?.headers);
		// host is required by AWS Signature V4: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
		headers.set('host', url.host);

		const request = new HttpRequest({
			hostname: url.hostname,
			path: url.pathname,
			protocol: url.protocol,
			method: init!.method.toUpperCase(), // method must be uppercase
			body: init!.body,
			query: parseQueryString(url.search),
			headers: Object.fromEntries(headers.entries())
		});

		const signer = new SignatureV4({
			credentials: credentials || defaultProvider(),
			service,
			region,
			sha256: Sha256,
		});

		const signedRequest = await signer.sign(request);

		return fetchFn(input, { headers: signedRequest.headers, body: signedRequest.body, method: signedRequest.method });
	}
};