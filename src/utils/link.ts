export function faviconLinkBuilder(origin: string) {
  return `${process.env.baseUrl}/api/favicon?url=${origin}`;
}
