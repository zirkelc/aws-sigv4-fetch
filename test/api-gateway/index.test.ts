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

const REGION = "us-east-1";
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

		restApiId = api.id;
		console.log("REST API Created: ", restApiId);

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

		await client.send(
			new PutMethodCommand({
				restApiId: restApiId,
				resourceId: resourceId,
				httpMethod: "GET",
				authorizationType: "AWS_IAM",
			}),
		);

		await client.send(
			new PutIntegrationCommand({
				restApiId: restApiId,
				resourceId: resourceId,
				httpMethod: "GET",
				type: "MOCK",
				requestTemplates: {
					"application/json": '{"statusCode": 200}',
				},
			}),
		);

		await client.send(
			new PutIntegrationResponseCommand({
				restApiId: restApiId,
				resourceId: resourceId,
				httpMethod: "GET",
				statusCode: "200",
				responseTemplates: {
					"application/json": JSON.stringify(response),
				},
			}),
		);

		await client.send(
			new PutMethodResponseCommand({
				restApiId: restApiId,
				resourceId: resourceId,
				httpMethod: "GET",
				statusCode: "200",
				responseModels: {
					"application/json": "Empty",
				},
			}),
		);

		const deploymentResponse = await client.send(
			new CreateDeploymentCommand({
				restApiId: restApiId,
				stageName: "test",
			}),
		);
		const deploymentId = deploymentResponse.id;
		if (!deploymentId) throw new Error("Deployment not found");

		const apiUrl = `https://${restApiId}.execute-api.${REGION}.amazonaws.com/test/mock`;

		return apiUrl;
	};

	try {
		const api = await findApi(API_NAME);
		if (api?.id) await deleteApi(api.id);
		url = await createApi(API_NAME, API_RESPONSE);

		console.log(`API created and deployed at: ${url}`);
	} catch (error) {
		console.error("Error setting up the REST API: ", error);
	}

	return async () => {
		await deleteApi(restApiId);
	};
});

describe("APIGateway", () => {
	it("should handle GET", async () => {
		const fetch = createSignedFetcher({
			service: "execute-api",
			region: REGION,
		});

		const response = await fetch(url);

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
