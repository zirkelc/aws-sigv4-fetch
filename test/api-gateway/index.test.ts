import {
	APIGatewayClient,
	CreateDeploymentCommand,
	CreateResourceCommand,
	CreateRestApiCommand,
	DeleteRestApiCommand,
	GetResourcesCommand,
	GetRestApisCommand,
	PutIntegrationCommand,
	PutIntegrationResponseCommand,
	PutMethodCommand,
	PutMethodResponseCommand,
} from "@aws-sdk/client-api-gateway";
import "cross-fetch/polyfill";
import { beforeAll, describe, expect, it } from "vitest";
import { createSignedFetcher } from "../../src/index.js";

const SERVICE = "execute-api";
const REGION = "us-east-1";
const STAGE = "test";
const API_NAME = "aws-sigv4-fetch";
const API_RESPONSE = { foo: "bar" };

let apiRootUrl = "";

beforeAll(async () => {
	const client = new APIGatewayClient({ region: REGION });
	let restApiId: string | undefined;

	const deleteApi = async (restApiId?: string) => {
		if (!restApiId) return;
		const deleteRestApiCommand = new DeleteRestApiCommand({
			restApiId: restApiId,
		});
		await client.send(deleteRestApiCommand);
	};

	const findApi = async (apiName: string) => {
		const apisResponse = await client.send(new GetRestApisCommand({}));
		const api = apisResponse.items?.find((api) => api.name === apiName);
		return api;
	};

	const createApi = async (
		apiName: string,
		response: Record<string, string>,
	) => {
		const api = await client.send(
			new CreateRestApiCommand({
				name: apiName,
				description: `${apiName}: Mock REST API for testing with IAM authentication`,
			}),
		);

		const restApiId = api.id;
		if (!restApiId) throw new Error("API not created");

		const resourcesResponse = await client.send(
			new GetResourcesCommand({
				restApiId: restApiId,
			}),
		);
		const rootResource = resourcesResponse.items?.find(
			(item) => item.path === "/",
		);

		const rootResourceId = rootResource?.id;
		if (!rootResourceId) throw new Error("Root resource not found");

		const resourceCreationResponse = await client.send(
			new CreateResourceCommand({
				restApiId: restApiId,
				parentId: rootResourceId,
				pathPart: "mock",
			}),
		);
		const mockResourceId = resourceCreationResponse.id;
		if (!mockResourceId) throw new Error("Resource not found");

		const httpMethods = ["GET", "POST"];

		// resource /mock
		for (const httpMethod of httpMethods) {
			await client.send(
				new PutMethodCommand({
					restApiId,
					resourceId: mockResourceId,
					httpMethod,
					authorizationType: "AWS_IAM",
				}),
			);

			await client.send(
				new PutIntegrationCommand({
					restApiId,
					resourceId: mockResourceId,
					httpMethod,
					type: "MOCK",
					requestTemplates: {
						"application/json": '{"statusCode": 200}',
					},
				}),
			);

			await client.send(
				new PutIntegrationResponseCommand({
					restApiId,
					resourceId: mockResourceId,
					httpMethod,
					statusCode: "200",
					responseTemplates: {
						"application/json": JSON.stringify(response),
					},
				}),
			);

			await client.send(
				new PutMethodResponseCommand({
					restApiId,
					resourceId: mockResourceId,
					httpMethod,
					statusCode: "200",
					responseModels: {
						"application/json": "Empty",
					},
				}),
			);
		}

		const proxyResourceCreationResponse = await client.send(
			new CreateResourceCommand({
				restApiId: restApiId,
				parentId: mockResourceId,
				pathPart: "{proxy+}",
			}),
		);
		const proxyResourceId = proxyResourceCreationResponse.id;
		if (!proxyResourceId) throw new Error("Proxy resource not found");

		// resource /mock/{proxy+}
		for (const httpMethod of httpMethods) {
			await client.send(
				new PutMethodCommand({
					restApiId,
					resourceId: proxyResourceId,
					httpMethod,
					authorizationType: "AWS_IAM",
				}),
			);

			await client.send(
				new PutIntegrationCommand({
					restApiId,
					resourceId: proxyResourceId,
					httpMethod,
					type: "MOCK",
					requestTemplates: {
						"application/json": '{"statusCode": 200}',
					},
				}),
			);

			await client.send(
				new PutIntegrationResponseCommand({
					restApiId,
					resourceId: proxyResourceId,
					httpMethod,
					statusCode: "200",
					responseTemplates: {
						"application/json": JSON.stringify(response),
					},
				}),
			);

			await client.send(
				new PutMethodResponseCommand({
					restApiId,
					resourceId: proxyResourceId,
					httpMethod,
					statusCode: "200",
					responseModels: {
						"application/json": "Empty",
					},
				}),
			);
		}

		const deploymentResponse = await client.send(
			new CreateDeploymentCommand({
				restApiId: restApiId,
				stageName: "test",
			}),
		);
		const deploymentId = deploymentResponse.id;
		if (!deploymentId) throw new Error("Deployment not found");

		return api;
	};

	try {
		// doesn't work on CI if tests are run in parallel
		let api = await findApi(API_NAME);
		if (!api?.id) api = await createApi(API_NAME, API_RESPONSE);

		restApiId = api.id;
		if (!restApiId) throw new Error("API not created");

		apiRootUrl = `https://${restApiId}.execute-api.${REGION}.amazonaws.com/${STAGE}`;
	} catch (error) {
		console.error("Error setting up the REST API: ", error);
		throw error;
	}

	return async () => {
		// await deleteApi(restApiId);
	};
});

const paths = ["/mock", "/mock/foo", "/mock/foo-*"];

describe("APIGateway", () => {
	beforeAll(async () => {
		if (!apiRootUrl) throw new Error("API URL not set");
	});

	it.only.each(paths)("should GET %s", async (path) => {
		const fetch = createSignedFetcher({
			service: SERVICE,
			region: REGION,
			encodeRfc3986: true,
		});

		console.log(`${apiRootUrl}${path}`);
		const response = await fetch(`${apiRootUrl}${path}`, { method: "GET" });

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toEqual(API_RESPONSE);
	});

	it.each(paths)("should POST %s", async (path) => {
		const fetch = createSignedFetcher({
			service: SERVICE,
			region: REGION,
			encodeRfc3986: true,
		});

		const response = await fetch(`${apiRootUrl}${path}`, {
			method: "POST",
			body: JSON.stringify({}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toEqual(API_RESPONSE);
	});

	it("should throw an error for unsigned fetch", async () => {
		const response = await fetch(`${apiRootUrl}/mock`);

		expect(response.status).toBe(403);
		expect(response.statusText).toBe("Forbidden");
	});
});
