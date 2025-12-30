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
