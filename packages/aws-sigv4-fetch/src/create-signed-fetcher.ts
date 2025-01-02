import type { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { signRequest } from "aws-sigv4-sign";
import { getFetchFn } from "./get-fetch.js";

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
 */
export const createSignedFetcher: CreateSignedFetcher = (options: SignedFetcherOptions): typeof fetch => {
  const fetchFn = getFetchFn(options.fetch);
  const signOptions = { service: options.service, region: options.region, credentials: options.credentials };

  return async (input, init?) => {
    const signedRequest = init ? await signRequest(input, init, signOptions) : await signRequest(input, signOptions);

    return fetchFn(signedRequest);
  };
};
