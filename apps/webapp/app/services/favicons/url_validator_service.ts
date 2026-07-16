import logger from '@adonisjs/core/services/logger';

export class UrlValidatorService {
	private readonly localhostPatterns = [
		'localhost',
		'127.0.0.1',
		'0.0.0.0',
		'::1',
		'[::1]',
	];

	private readonly privateIpRanges = [
		{ start: '10.0.0.0', end: '10.255.255.255' },
		{ start: '172.16.0.0', end: '172.31.255.255' },
		{ start: '192.168.0.0', end: '192.168.255.255' },
		{ start: '169.254.0.0', end: '169.254.255.255' },
	];

	private readonly localDomains = ['.local', '.localhost', '.internal', '.lan'];

	isUrlAllowed(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			const hostname = parsedUrl.hostname.toLowerCase();

			if (this.isLocalhost(hostname)) {
				logger.debug(`Blocked localhost URL: ${url}`);
				return false;
			}

			if (this.isPrivateIp(hostname)) {
				logger.debug(`Blocked private IP URL: ${url}`);
				return false;
			}

			if (this.isLocalDomain(hostname)) {
				logger.debug(`Blocked local domain URL: ${url}`);
				return false;
			}

			return true;
		} catch (error) {
			logger.warn(`Invalid URL format: ${url}`, error);
			return false;
		}
	}

	private isLocalhost(hostname: string): boolean {
		return this.localhostPatterns.some((pattern) => hostname === pattern);
	}

	private isPrivateIp(hostname: string): boolean {
		const ipMatch = hostname.match(
			/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
		);
		if (!ipMatch) {
			return false;
		}

		const ip = hostname;
		return this.privateIpRanges.some((range) =>
			this.isIpInRange(ip, range.start, range.end)
		);
	}

	private isIpInRange(ip: string, start: string, end: string): boolean {
		const ipNum = this.ipToNumber(ip);
		const startNum = this.ipToNumber(start);
		const endNum = this.ipToNumber(end);
		return ipNum >= startNum && ipNum <= endNum;
	}

	private ipToNumber(ip: string): number {
		return (
			ip
				.split('.')
				.reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>>
			0
		);
	}

	private isLocalDomain(hostname: string): boolean {
		return this.localDomains.some((domain) => hostname.endsWith(domain));
	}
}
