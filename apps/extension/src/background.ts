import { getRuntime } from "~lib/extension-runtime"

const runtime = getRuntime()

runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		void Promise.resolve(runtime.openOptionsPage())
	}
})
