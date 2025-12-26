import { Collection, CollectionWithLinks, Link } from '#shared/types/dto';

export const appendCollectionId = (
	url: string,
	collectionId?: Collection['id'] | null | undefined
) => `${url}${collectionId ? `?collectionId=${collectionId}` : ''}`;

export const appendLinkId = (
	url: string,
	linkId?: Link['id'] | null | undefined
) => `${url}${linkId ? `?linkId=${linkId}` : ''}`;

export const appendResourceId = (
	url: string,
	resourceId?: Collection['id'] | Link['id']
) => `${url}${resourceId ? `/${resourceId}` : ''}`;

export function isValidHttpUrl(urlParam: string) {
	const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?(\?.*)?(#[^#]*)?$/;
	const domainRegex =
		/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?(\?.*)?(#[^#]*)?$/;
	const simpleDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;

	let urlToTest = urlParam.trim();

	if (urlToTest.startsWith('http://') || urlToTest.startsWith('https://')) {
		try {
			const url = new URL(urlToTest);
			return url.protocol === 'http:' || url.protocol === 'https:';
		} catch (_) {
			return false;
		}
	}

	if (ipv4Regex.test(urlToTest)) {
		try {
			new URL(`http://${urlToTest}`);
			return true;
		} catch (_) {
			return false;
		}
	}

	if (domainRegex.test(urlToTest)) {
		try {
			new URL(`http://${urlToTest}`);
			return true;
		} catch (_) {
			return false;
		}
	}

	if (simpleDomainRegex.test(urlToTest)) {
		try {
			new URL(`http://${urlToTest}`);
			return true;
		} catch (_) {
			return false;
		}
	}

	return false;
}

export const generateShareUrl = (
	collection: Collection | CollectionWithLinks
) => {
	const pathname = `/shared/${collection.id}`;
	if (typeof window === 'undefined') return pathname;
	return `${window.location.origin}${pathname}`;
};

export const buildUrl = (url: string, params: Record<string, string>) => {
	const urlObj = new URL(url);
	Object.entries(params).forEach(([key, value]) => {
		urlObj.searchParams.set(key, value);
	});
	return urlObj.toString();
};

export function getCurrentPathAndSearch(): string {
	if (typeof window === 'undefined') return '';
	return `${window.location.pathname}${window.location.search}`;
}

export function getUrlPathname(rawUrl: string): string {
	try {
		const url = new URL(rawUrl, window.location.origin);
		return url.pathname;
	} catch {
		return rawUrl;
	}
}

export function restartCssAnimation(
	element: HTMLElement,
	className: string
): void {
	element.classList.remove(className);
	// Force reflow to ensure animation restarts when re-adding the class
	void element.offsetWidth;
	element.classList.add(className);
}
