export function faviconLinkBuilder(origin: string, size: number = 32) {
	return `http://localhost:3000/api/favicon?url=${origin}`;
}
