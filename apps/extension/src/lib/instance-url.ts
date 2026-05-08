export function normalizeInstanceBaseUrl(raw: string): string | null {
	const t = raw.trim()
	if (!t) {
		return null
	}
	const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`
	try {
		const u = new URL(withScheme)
		if (u.protocol !== "http:" && u.protocol !== "https:") {
			return null
		}
		let path = u.pathname.replace(/\/+$/, "")
		if (path === "/") {
			path = ""
		}
		return `${u.origin}${path}`
	} catch {
		return null
	}
}
