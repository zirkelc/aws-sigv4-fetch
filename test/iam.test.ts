import { createSignedFetcher } from '../dist/index';

test('[GET] get current user', async () => {
	const fetch = createSignedFetcher({ service: 'iam', region: 'us-east-1' });
	const url = 'https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08';

	const response = await fetch(url, {
		method: 'GET'
	});

	expect(response.status).toBe(200);

	const data = await response.text();

	expect(data).toContain('<GetUserResult>');
})

test('[POST] get current user', async () => {
	const fetch = createSignedFetcher({ service: 'iam', region: 'us-east-1' });

	const url = 'https://iam.amazonaws.com/';
	const body = 'Action=GetUser&Version=2010-05-08'	
	
	const response = await fetch(url, {
		method: 'POST',
		body,
		headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
	});

	expect(response.status).toBe(200);

	const data = await response.text();

	expect(data).toContain('<GetUserResult>');
})