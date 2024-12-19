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

  return async (input, init?) => {
    // const service = opts.service;
    // const region = opts.region || "us-east-1";
    // const credentials = opts.credentials || defaultProvider();

    // const parsedRequest = parseRequest(input, init);
    // const parsedUrl = parsedRequest.url;

    // // host is required by AWS Signature V4: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
    // parsedRequest.headers["host"] = parsedUrl.host;

    // const httpRequest = new HttpRequest({
    //   method: parsedRequest.method,
    //   body: parsedRequest.body,
    //   headers: parsedRequest.headers,
    //   hostname: parsedUrl.hostname,
    //   path: parsedUrl.pathname,
    //   protocol: parsedUrl.protocol,
    //   port: parsedUrl.port ? Number(parsedUrl.port) : undefined,
    //   username: parsedUrl.username,
    //   password: parsedUrl.password,
    //   fragment: parsedUrl.hash,
    //   query: Object.fromEntries(parsedUrl.searchParams.entries()),
    // });

    // const signer = new SignatureV4({
    //   credentials,
    //   service,
    //   region,
    //   sha256: Sha256,
    // });

    // const signedHttpRequest = await signer.sign(httpRequest);

    // // Copy only the signed headers, because the body may be modified by the signer
    // parsedRequest.headers = signedHttpRequest.headers;

    // return fetchFn(parsedUrl, parsedRequest);
    const { service, region, credentials } = opts;
    const signedRequest = init
      ? await signRequest(input, init, { service, region, credentials })
      : await signRequest(input, { service, region, credentials });

    return fetchFn(signedRequest);
  };
};
