export const makeRequestWithCredentials = async (
	url: string,
	{ headers, ...options }: RequestInit
) =>
	fetch(url, {
		headers: {
			...headers,
			Accept: 'application/json',
		},
		...options,
		credentials: 'include',
	});
