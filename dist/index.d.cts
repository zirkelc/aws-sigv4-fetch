import { AwsCredentialIdentity, Provider } from '@aws-sdk/types';

type SignedFetcherOptions = {
    service: string;
    region?: string;
    credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
    fetch?: typeof fetch;
    encodeRfc3986?: boolean;
};
type CreateSignedFetcher = (init: SignedFetcherOptions) => typeof fetch;
declare const createSignedFetcher: CreateSignedFetcher;

export { type CreateSignedFetcher, type SignedFetcherOptions, createSignedFetcher };
