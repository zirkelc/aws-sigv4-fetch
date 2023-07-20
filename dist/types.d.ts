/// <reference lib="dom" />
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
export type SignedFetcherOptions = {
    service: string;
    region?: string;
    credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
    fetch?: typeof fetch;
};
export type CreateSignedFetcher = (init: SignedFetcherOptions) => typeof fetch;
