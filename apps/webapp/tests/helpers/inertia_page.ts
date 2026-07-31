import type { ApiResponse } from '@japa/api-client';

/**
 * The props of a rendered Inertia page.
 *
 * `assertInertiaPropsContains` covers most assertions, but not the ones that
 * have to look inside a collection the instance did not build alone — the
 * accounts table holds whatever the developer's database already had. Those
 * specs read the props and pick out the row they seeded.
 *
 * The guard is what turns the forgotten `withInertia()` into a sentence rather
 * than a `Cannot read properties of undefined` twenty lines further down.
 */
export function inertiaPageProps(response: ApiResponse) {
	const body = response.body();
	if (typeof body === 'string') {
		throw new Error(
			'the response is a rendered document, not an Inertia page — the request is missing withInertia()'
		);
	}

	return body.props;
}
