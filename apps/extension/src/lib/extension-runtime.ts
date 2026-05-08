type Runtime = {
	onInstalled: {
		addListener: (cb: (d: { reason: string }) => void) => void
	}
	openOptionsPage: () => Promise<void> | void
}

export function getRuntime(): Runtime {
	const w = globalThis as typeof globalThis & {
		browser?: { runtime: Runtime }
		chrome?: { runtime: Runtime }
	}
	const r = w.browser?.runtime ?? w.chrome?.runtime
	if (!r) {
		throw new Error("extension runtime is not available")
	}
	return r
}
