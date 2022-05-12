[![npm version](https://badge.fury.io/js/aws-sigv4-fetch.svg)](https://badge.fury.io/js/aws-sigv4-fetch)
# aws-sigv4-fetch
AWS SignatureV4 fetch API function to automatically sign HTTP request with given AWS credentials. Built entirely on the newest version of the official [AWS SDK for JS](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html).

## Signature Version 4 
> Signature Version 4 (SigV4) is the process to add authentication information to AWS API requests sent by HTTP. For security, most requests to AWS must be signed with an access key. The access key consists of an access key ID and secret access key, which are commonly referred to as your security credentials

[AWS documentation on Signature Version 4 signing process](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)

## Install
```sh
npm install --save aws-sigv4-fetch
```

## Usage
This package exports a function `createSignedFetcher` that returns a `fetch` function to automtaically sign HTTP requests with AWS Signature V4 for the given AWS service and region. The credentials can be passed to the function directly, or they will be retrieved from the environment via `defaultProvider()` from package [`@aws-sdk/credential-provider-node`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_provider_node.html).
```ts
import { createSignedFetcher } from 'aws-sigv4-fetch';

const fetch = createSignedFetcher({ service: 'appsync', region: 'eu-west-1' });
const url = 'https://mygraphqlapi.appsync-api.eu-west-1.amazonaws.com/graphql';

const body = { a: 1 };

const response = await fetch(url, {
  method: 'post',
  body: JSON.stringify(body),
  headers: {'Content-Type': 'application/json'}
});

const data = await response.json();
```

### Sign GraphQL Requests with `graphql-request`
The package [`graphql-request`](https://www.npmjs.com/package/graphql-request) allows to pass a [custom `fetch` method](https://github.com/prisma-labs/graphql-request#using-a-custom-fetch-method) as option:

```ts
import { createSignedFetcher } from 'aws-sigv4-fetch';
import { GraphQLClient } from 'graphql-request';

const fetch = createSignedFetcher({ service: 'appsync', region: 'eu-west-1' });
const url = 'https://mygraphqlapi.appsync-api.eu-west-1.amazonaws.com/graphql';

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

const client = new GraphQLClient(url, {
  fetch: createSignedFetcher({ service: 'appsync', region }),
});

const result = await client.request(query, variables);
```

## Resources
- [Sign GraphQL Request with AWS IAM and Signature V4](https://dev.to/zirkelc/sign-graphql-request-with-aws-iam-and-signature-v4-2il6)
- [Amplify Signing a request from Lambda](https://docs.amplify.aws/lib/graphqlapi/graphql-from-nodejs/q/platform/js/#signing-a-request-from-lambda)
- [Signing HTTP requests to Amazon OpenSearch Service
](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/request-signing.html#request-signing-node)