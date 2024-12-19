import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import type { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { parseRequest } from "./parse-request.js";

export type SignRequestOptions = {
  service: string;
  region?: string;
  credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
};

export function signRequest(input: string | Request | URL, options: SignRequestOptions): Promise<Request>;
export function signRequest(
  input: string | Request | URL,
  init: RequestInit,
  options: SignRequestOptions,
): Promise<Request>;
export async function signRequest(
  ...args:
    | [input: string | Request | URL, options: SignRequestOptions]
    | [input: string | Request | URL, init: RequestInit, options: SignRequestOptions]
): Promise<Request> {
  let request: string | Request | URL;
  let init: RequestInit | undefined;
  let options: SignRequestOptions;

  if (args.length === 2) {
    request = args[0];
    options = args[1];
  } else {
    request = args[0];
    init = args[1];
    options = args[2];
  }

  const { url, method, body, headers, ...requestInit } = await parseRequest(request, init);

  // const parsedRequest = await parseRequest(request, init);
  // const url = new URL(parsedRequest.url);

  // host is required by AWS Signature V4: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
  headers["host"] = url.host;

  const service = options.service;
  const region = options.region || "us-east-1";
  const credentials = options.credentials || defaultProvider();

  const httpRequest = new HttpRequest({
    method,
    body,
    headers,
    hostname: url.hostname,
    path: url.pathname,
    protocol: url.protocol,
    port: url.port ? Number(url.port) : undefined,
    username: url.username,
    password: url.password,
    fragment: url.hash,
    query: Object.fromEntries(url.searchParams.entries()),
  });

  const signer = new SignatureV4({
    credentials,
    service,
    region,
    sha256: Sha256,
  });

  const { headers: signedHeaders } = await signer.sign(httpRequest);

  // Copy only the signed headers, because the body may be modified by the signer
  // parsedRequest.headers = signedHttpRequest.headers;
  // for (const [key, value] of Object.entries(signedHttpRequest.headers)) {
  //   parsedRequest.headers.set(key, value);
  // }

  const signedRequestInit = { ...requestInit, method, body, headers: signedHeaders };

  return new Request(url, signedRequestInit);
}
