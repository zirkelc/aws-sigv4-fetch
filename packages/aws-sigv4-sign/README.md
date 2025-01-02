# aws-sigv4-sign
A small library to sign HTTP requests with AWS Signature Version 4 (SigV4) authentication.
Built on the official AWS SDK for JS v3.

> [!TIP]
> If you are using the `fetch` API, consider using the [`aws-sigv4-fetch`](https://github.com/zirkelc/aws-sigv4/tree/main/packages/aws-sigv4-fetch) package to automatically sign requests.

## Install
```sh
npm install --save aws-sigv4-sign
```

## ESM and CommonJS
This package ships with ES Module and CommonJS support. That means you can `import` or `require` the package in your project depending on your module format.

```ts
// ESM
import { signRequest } from 'aws-sigv4-sign';

// CommonJS
const { signRequest } = require('aws-sigv4-sign');
```

## Usage
This package exports a `signRequest` function that returns a `Request` object with signed headers for AWS Signature V4 (SigV4) authentication.
The function is overloaded with multiple signatures to make it easier to use.

```ts
import { signRequest, SignRequestOptions } from 'aws-sigv4-sign';

const options: SignRequestOptions = {
  service: 'lambda',         // required
  region: 'eu-west-1',       // optional (defaults to 'us-east-1')
  credentials: {             // optional (defaults to credentials from environment)
    accessKeyId: '...',
    secretAccessKey: '...',
  }
};

const url = 'https://mylambda.lambda-url.eu-west-1.on.aws/';

// signRequest(input: string)
const signedRequest = await signRequest(url, options);

// signRequest(input: URL)
const signedRequest = await signRequest(new URL(url), options);

// signRequest(input: Request)
const signedRequest = await signRequest(new Request(url), options);

// signRequest(input: string, init?: RequestInit)
const signedRequest = await signRequest(url,
  {
    method: 'POST',
    body: JSON.stringify({ a: 1 }),
    headers: { 'Content-Type': 'application/json' }
  },
  options
);
```

The return `Request` object contains the signed authorization `headers` with the following keys: `authorization`, `host`, `x-amz-date`, `x-amz-content-sha256`, `x-amz-security-token` (optional).

```ts
const { headers } = await signRequest(url, options);

console.log(headers.get('authorization')); // AWS4-HMAC-SHA256 Credential=.../20250101/us-east-1/lambda/aws4_request, SignedHeaders=host;x-amz-date;x-amz-content-sha256;x-amz-security-token, Signature=...
console.log(headers.get('host')); // mylambda.lambda-url.eu-west-1.on.aws
console.log(headers.get('x-amz-date')); // 20250101T000000Z
console.log(headers.get('x-amz-content-sha256')); // ...
console.log(headers.get('x-amz-security-token')); // only if credentials include a session token
```

### Options

The `signRequest` function accepts the following options:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `service` | `string` | Required | The `service` is **required** and must match the AWS service you are signing requests for. If it doesn't match, the request will fail with an error like: `Credential should be scoped to correct service: 'service'`. |
| `region` | `string` | `us-east-1` | The `region` is **optional** and defaults to `us-east-1` if not provided. Some services like IAM are global and don't require a region. |
| `credentials` | `object` | Read from environment | The `credentials` is **optional**. If not provided, the credentials will be retrieved from the environment by the package [`@aws-sdk/credential-provider-node`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_provider_node.html). |


## Examples

### Axios

```ts
```

### Got

```ts
```

### Ky

```ts
```

### node:https

```ts
```

## License
MIT
