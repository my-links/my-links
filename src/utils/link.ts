export function faviconLinkBuilder(origin: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/favicon?url=${origin}`;
}
