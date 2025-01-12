# aws-sigv4-fetch
A small wrapper around the [`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to automatically sign HTTP requests with AWS Signature Version 4 (SigV4) authentication, built with the official AWS SDK.

> [!TIP]
> If you are using other HTTP libraries like Axios, Ky, Got, or any other HTTP library, consider using the [`aws-sigv4-sign`](https://github.com/zirkelc/aws-sigv4/tree/main/packages/aws-sigv4-sign) package to sign requests.

## Install
```sh
npm install --save aws-sigv4-fetch
```

## ESM and CommonJS
This package ships with ES Module and CommonJS support. That means you can `import` or `require` the package in your project depending on your module format.

```ts
// ESM
import { createSignedFetcher } from 'aws-sigv4-fetch';

// CommonJS
const { createSignedFetcher } = require('aws-sigv4-fetch');
```

## Usage
This package exports a `createSignedFetcher` function that returns a `fetch` function to automatically sign HTTP requests with AWS Signature V4 authentication.
The returned function has the same signature as the default `fetch` function and can be used as a drop-in replacement.


```ts
import { createSignedFetcher, SignedFetcherOptions } from 'aws-sigv4-fetch';

const options: SignedFetcherOptions = {
  service: 'lambda',         // required
  region: 'eu-west-1',       // optional (defaults to 'us-east-1')
  credentials: {             // optional (defaults to credentials from environment)
    accessKeyId: '...',
    secretAccessKey: '...',
  }
  fetch: fetch,              // optional (defaults to native fetch)
};

const signedFetch = createSignedFetcher(options);

const url = 'https://mylambda.lambda-url.eu-west-1.on.aws/';

// signedFetch(input: string)
const response = await signedFetch(url);

// signedFetch(input: URL)
const response = await signedFetch(new URL(url));

// signedFetch(input: Request)
const response = await signedFetch(new Request(url));

// signedFetch(input: string, init?: RequestInit)
const response = await signedFetch(url,
  {
    method: 'POST',
    body: JSON.stringify({ a: 1 }),
    headers: { 'Content-Type': 'application/json' }
  },
  options
);
```

### Options

The `createSignedFetcher` function accepts the following options:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `service` | `string` | Required | The `service` is **required** and must match the AWS service you are signing requests for. If it doesn't match, the request will fail with an error like: `Credential should be scoped to correct service: 'service'`. |
| `region` | `string` | `us-east-1` | The `region` is **optional** and defaults to `us-east-1` if not provided. Some services like IAM are global and don't require a region. |
| `credentials` | `object` | Read from environment | The `credentials` is **optional**. If not provided, the credentials will be retrieved from the environment by the package [`@aws-sdk/credential-provider-node`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_provider_node.html). |
| `fetch` | `fetch` | Native `fetch` | The `fetch` function is **optional**. If not provided, the native `fetch` function will be used. |


#### Fetch
The `fetch` function is optional. If not provided, the `fetch` function from the environment will be used. Native `fetch` is supported in Node.js >= v18. If you are running in an environment where native `fetch` is **not** available, the `fetch` function must be polyfilled or provided as an argument to `createSignedFetcher`. This allows to use the same `fetch` function that is already used in your application. There are several ways to do this:

##### Native `fetch`
If native `fetch` is available, you don't have to pass it as option to `createSignedFetcher`.

```ts
// native fetch is available and doesn't have to be passed as option
const signedFetch = createSignedFetcher({
  service: 'lambda',
  region: 'eu-west-1'
});
```

##### Polyfill `fetch`
Install a fetch package like [`cross-fetch`](https://www.npmjs.com/package/cross-fetch) and import it as [polyfill](https://en.wikipedia.org/wiki/Polyfill_(programming)). The `fetch` function will be available **globally** after importing the polyfill.

```ts
import 'cross-fetch/polyfill';

// fetch was imported globally and doesn't have to be passed as option
const signedFetch = createSignedFetcher({
  service: 'iam',
  region: 'eu-west-1'
});
```

##### Pass `fetch` as an argument
Install a fetch package like [`cross-fetch`](https://www.npmjs.com/package/cross-fetch) and import it as [ponyfill](https://github.com/sindresorhus/ponyfill). The `fetch` function will be available **locally** after importing the ponyfill. Pass the `fetch` function as an argument to `createSignedFetcher`:

```ts
import fetch from 'cross-fetch';

// fetch was imported locally and must be passed as option
const signedFetch = createSignedFetcher({
  service: 'iam',
  region: 'eu-west-1',
  fetch: fetch
});
```

## Examples

### API Gateway
```ts
const signedFetch = createSignedFetcher({ service: 'execute-api', region: 'eu-west-1' });
const response = await signedFetch('https://myapi.execute-api.eu-west-1.amazonaws.com/my-stage/my-resource');
```

### Lambda Function URL
```ts
const signedFetch = createSignedFetcher({ service: 'lambda', region: 'eu-west-1' });
const response = await signedFetch(new URL('https://mylambda.lambda-url.eu-west-1.on.aws/'));
```

### AppSync
```ts
const signedFetch = createSignedFetcher({ service: 'appsync', region: 'eu-west-1' });
const response = await signedFetch('https://mygraphqlapi.appsync-api.eu-west-1.amazonaws.com/graphql', {
  method: 'POST',
  body: JSON.stringify({ a: 1 }),
  headers: {'Content-Type': 'application/json'}
});
```

### Automatically sign GraphQL Requests with `graphql-request`
If you are using [`graphql-request`](https://www.npmjs.com/package/graphql-request) as GraphQL library, you can easily sign all HTTP requests. The library has `fetch` option to pass a [custom `fetch` method](https://github.com/prisma-labs/graphql-request#using-a-custom-fetch-method):

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

## License
MIT
