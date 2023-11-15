import { describe, it, expect } from 'vitest';
import 'cross-fetch/polyfill';
import { createSignedFetcher } from '../dist/index';

describe('IAM', () => {
	describe('GET', () => {
		it('should get current user', async () => {
			const url = 'https://iam.amazonaws.com/?Action=GetUser&Version=2010-05-08';

			const fetch = createSignedFetcher({ service: 'iam', region: 'us-east-1' });
			const response = await fetch(url, {
				method: 'GET'
			});

			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain('<GetUserResult>');
		})
	})

	describe('POST', () => {
		it('should get current user', async () => {
			const url = 'https://iam.amazonaws.com/';
			const body = 'Action=GetUser&Version=2010-05-08'

			const fetch = createSignedFetcher({ service: 'iam', region: 'us-east-1' });
			const response = await fetch(url, {
				method: 'POST',
				body,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
			});

			expect(response.status).toBe(200);

			const data = await response.text();
			expect(data).toContain('<GetUserResult>');
		})
	})
})
