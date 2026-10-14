import { urlFor } from '~/lib/tuyau';

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';

function readXsrfToken(): string {
	const cookie = document.cookie
		.split('; ')
		.find((entry) => entry.startsWith(`${XSRF_COOKIE_NAME}=`));
	if (!cookie) return '';
	return decodeURIComponent(cookie.slice(XSRF_COOKIE_NAME.length + 1));
}

export function recordLinkVisit(linkId: number): void {
	fetch(urlFor('link.record-visit', { id: linkId }), {
		method: 'POST',
		keepalive: true,
		credentials: 'same-origin',
		// Shield answers a CSRF rejection with a redirect back, which would otherwise land as a silent 200.
		redirect: 'error',
		headers: { [XSRF_HEADER_NAME]: readXsrfToken() },
	})
		.then((response) => {
			if (!response.ok) {
				console.error('Failed to record link visit', response.status);
			}
		})
		.catch((error: unknown) => {
			console.error('Failed to record link visit', error);
		});
}
