[![CI](https://github.com/zirkelc/aws-sigv4/actions/workflows/ci.yml/badge.svg)](https://github.com/zirkelc/aws-sigv4/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/dt/aws-sigv4-fetch?label=aws-sigv4-fetch)](https://www.npmjs.com/package/aws-sigv4-fetch)
[![npm](https://img.shields.io/npm/dt/aws-sigv4-sign?label=aws-sigv4-sign)](https://www.npmjs.com/package/aws-sigv4-sign)

# AWS SigV4 libraries

This repository contains two libraries to sign HTTP requests with AWS Signature Version 4 (SigV4):

- [`aws-sigv4-fetch`](https://www.npmjs.com/package/aws-sigv4-fetch) creates a `fetch` function to automatically sign HTTP requests.
- [`aws-sigv4-sign`](https://www.npmjs.com/package/aws-sigv4-sign) creates a `Request` object with signed headers that can be used with any other HTTP library.

## What is Signature Version 4?
> Signature Version 4 (SigV4) is the process to add authentication information to AWS API requests sent by HTTP. For security, most requests to AWS must be signed with an access key. The access key consists of an access key ID and secret access key, which are commonly referred to as your security credentials

[AWS documentation on Signature Version 4 signing process](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)

## Which library should I use?

### Are you using the `fetch` API?

Install the `aws-sigv4-fetch` package and use the `createSignedFetcher` function to create a signed fetch function:

```ts
import { createSignedFetcher } from 'aws-sigv4-fetch';

const signedFetch = createSignedFetcher({ service: 'lambda', region: 'eu-west-1' });

const response = await signedFetch('https://mylambda.lambda-url.eu-west-1.on.aws/');
```

### Are you using `Axios`, `Ky`, `Got`, `node:http` or any other HTTP library?

Install the `aws-sigv4-sign` package and use the `signRequest` function to create a signed request:

```ts
import { signRequest } from 'aws-sigv4-sign';
import axios from 'axios';

const signedRequest = await signRequest('https://mylambda.lambda-url.eu-west-1.on.aws/', {
  service: 'lambda',
  region: 'eu-west-1'
});

const { headers } = signedRequest;

console.log(headers.get('authorization')); // AWS4-HMAC-SHA256 Credential=.../20250101/us-east-1/lambda/aws4_request, SignedHeaders=host;x-amz-date;x-amz-content-sha256;x-amz-security-token, Signature=...
console.log(headers.get('host')); // mylambda.lambda-url.eu-west-1.on.aws
console.log(headers.get('x-amz-date')); // 20250101T000000Z
console.log(headers.get('x-amz-content-sha256')); // ...
console.log(headers.get('x-amz-security-token')); // only if credentials include a session token

// Axios
const response = await axios(signedRequest);

// Ky
const response = await ky.request(signedRequest);

// Got
const response = await got(signedRequest);

// node:http
const response = await httpRequest(signedRequest);
```

### Are you using `graphql-request`?

Install the `aws-sigv4-fetch` package and use the `createSignedFetcher` function to create a signed fetch function and pass it to the `fetch` option of the `GraphQLClient`:

```ts
import { createSignedFetcher } from 'aws-sigv4-fetch';
import { GraphQLClient } from 'graphql-request';

const query = `
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      createdAt
      updatedAt
      name
    }
  }
`;

const variables = {
  input: {
    name,
  },
};

const client = new GraphQLClient('https://mygraphqlapi.appsync-api.eu-west-1.amazonaws.com/graphql', {
  fetch: createSignedFetcher({ service: 'appsync', region: 'eu-west-1' }),
});

const result = await client.request(query, variables);
```

## Usage

Go to the docs of [aws-sigv4-fetch](packages/aws-sigv4-fetch/README.md) or [aws-sigv4-sign](packages/aws-sigv4-sign/README.md) for more information.

## Resources
- [Sign GraphQL Request with AWS IAM and Signature V4](https://dev.to/zirkelc/sign-graphql-request-with-aws-iam-and-signature-v4-2il6)
- [Amplify Signing a request from Lambda](https://docs.amplify.aws/lib/graphqlapi/graphql-from-nodejs/q/platform/js/#signing-a-request-from-lambda)
- [Signing HTTP requests to Amazon OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/request-signing.html#request-signing-node)

## License
MIT
