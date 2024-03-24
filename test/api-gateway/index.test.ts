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
import { createSignedFetcher } from "../../dist/index.js";

const SERVICE = "execute-api";
const REGION = "us-east-1";
const STAGE = "test";
const PATH = "mock";
const API_NAME = "aws-sigv4-fetch";
const API_RESPONSE = { test: "mock" };

let url = "";

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
		const resourceId = resourceCreationResponse.id;
		if (!resourceId) throw new Error("Resource not found");

		const httpMethods = ["GET", "POST"];
		for (const httpMethod of httpMethods) {
			await client.send(
				new PutMethodCommand({
					restApiId,
					resourceId,
					httpMethod,
					authorizationType: "AWS_IAM",
				}),
			);

			await client.send(
				new PutIntegrationCommand({
					restApiId,
					resourceId,
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
					resourceId,
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
					resourceId,
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

		url = `https://${restApiId}.execute-api.${REGION}.amazonaws.com/${STAGE}/${PATH}`;
	} catch (error) {
		console.error("Error setting up the REST API: ", error);
		throw error;
	}

	return async () => {
		// await deleteApi(restApiId);
	};
});

describe("APIGateway", () => {
	beforeAll(async () => {
		if (!url) throw new Error("API URL not set");
	});

	it("should handle GET", async () => {
		const fetch = createSignedFetcher({
			service: SERVICE,
			region: REGION,
		});

		const response = await fetch(url, { method: "GET" });

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toEqual(API_RESPONSE);
	});

	it("should handle POST", async () => {
		const fetch = createSignedFetcher({
			service: SERVICE,
			region: REGION,
		});

		const response = await fetch(url, {
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
		const response = await fetch(url);

		expect(response.status).toBe(403);
		expect(response.statusText).toBe("Forbidden");
	});
});
