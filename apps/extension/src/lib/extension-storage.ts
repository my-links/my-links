export type StoredExtensionAuth = {
	instanceUrl: string
	apiToken: string
	userId: string
}

const KEY = "mylinksAuth" as const

type StorageLocal = {
	get(keys: string): Promise<Record<string, unknown>>
	set(items: Record<string, unknown>): Promise<void>
	remove(keys: string): Promise<void>
}

function getStorageLocal(): StorageLocal {
	const w = globalThis as typeof globalThis & {
		browser?: {
			storage: {
				local: {
					get(keys: string): Promise<Record<string, unknown>>
					set(items: Record<string, unknown>): Promise<void>
					remove(keys: string): Promise<void>
				}
			}
		}
		chrome?: { storage?: { local: chrome.storage.StorageArea } }
	}
	const b = w.browser?.storage?.local
	if (b) {
		return {
			get: (keys) => b.get(keys),
			set: (items) => b.set(items),
			remove: (keys) => b.remove(keys)
		}
	}
	const c = w.chrome?.storage?.local
	if (c) {
		return {
			get: (keys) =>
				new Promise((resolve) => {
					c.get(keys, resolve as (x: object) => void)
				}),
			set: (items) =>
				new Promise((resolve, reject) => {
					c.set(items, () => {
						const err = w.chrome?.runtime?.lastError
						err ? reject(err) : resolve()
					})
				}),
			remove: (keys) =>
				new Promise((resolve, reject) => {
					c.remove(keys, () => {
						const err = w.chrome?.runtime?.lastError
						err ? reject(err) : resolve()
					})
				})
		}
	}
	throw new Error("storage.local is not available")
}

const area = getStorageLocal()

export async function getStoredAuth(): Promise<StoredExtensionAuth | null> {
	const v = await area.get(KEY)
	const a = v[KEY] as StoredExtensionAuth | undefined
	if (
		a &&
		typeof a.instanceUrl === "string" &&
		typeof a.apiToken === "string" &&
		typeof a.userId === "string"
	) {
		return a
	}
	return null
}

export async function setStoredAuth(auth: StoredExtensionAuth): Promise<void> {
	await area.set({ [KEY]: auth })
}

export async function clearStoredAuth(): Promise<void> {
	await area.remove(KEY)
}

export const EXTENSION_AUTH_MESSAGE = "MYLINKS_EXTENSION_AUTH" as const
