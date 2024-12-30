import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import type { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { getFetchFn } from "./get-fetch.js";
import { parseRequest } from "./parse-request.js";
import { signRequest } from "./sign-request.js";

export type SignedFetcherOptions = {
  service: string;
  region?: string;
  credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
  fetch?: typeof fetch;
};

export type CreateSignedFetcher = (init: SignedFetcherOptions) => typeof fetch;

/**
 * Create a signed fetch function that automatically signs requests with AWS Signature V4.
 * Service and region must be provided. Credentials can be provided if you want to sign requests with a specific set of credentials.
 * If no credentials are provided, the default credentials from `@aws-sdk/credential-provider-node` will be used.
 * See: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/request-signing.html#request-signing-node
 * @param init
 * @returns fetch
 */
export const createSignedFetcher: CreateSignedFetcher = (opts: SignedFetcherOptions): typeof fetch => {
  const fetchFn = getFetchFn(opts.fetch);
  const signOptions = { service: opts.service, region: opts.region, credentials: opts.credentials };

  return async (input, init?) => {
    const signedRequest = init ? await signRequest(input, init, signOptions) : await signRequest(input, signOptions);

    return fetchFn(signedRequest);
  };
};
