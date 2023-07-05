import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { parseQueryString } from '@aws-sdk/querystring-parser';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import fetch, { Headers } from 'cross-fetch';

type SignedFetcherInit = {
	service: string;
	region?: string;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}

type CreateSignedFetcher = (init: SignedFetcherInit) => typeof fetch;

/**
 * Create a signed fetch function that automatically signs requests with AWS Signature V4.
 * Service and region must be provided. Credentials can be provided if you want to sign requests with a specific set of credentials. 
 * If no credentials are provided, the default credentials from `@aws-sdk/credential-provider-node` will be used.
 * See: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/request-signing.html#request-signing-node
 * @param init 
 * @returns fetch
 */
export const createSignedFetcher: CreateSignedFetcher = ({ service, region = 'us-east-1', credentials }): typeof fetch => {
	return async (input, init?) => {
		const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);

		const headers = new Map<string, string>();
		// workaround because Headers.entries() is not available in cross-fetch
		new Headers(init!.headers).forEach((value, key) => headers.set(key, value));
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

		return fetch(input, { headers: signedRequest.headers, body: signedRequest.body, method: signedRequest.method });
	}
};
