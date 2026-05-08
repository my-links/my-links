import { useCallback, useEffect, useState } from "react"

import {
	EXTENSION_AUTH_MESSAGE,
	clearStoredAuth,
	getStoredAuth,
	setStoredAuth,
	type StoredExtensionAuth
} from "~lib/extension-storage"
import { normalizeInstanceBaseUrl } from "~lib/instance-url"

type Step = "choose" | "private-url" | "connecting" | "done"

const defaultPublicUrl =
	import.meta.env.PLASMO_PUBLIC_DEFAULT_INSTANCE_URL ?? "http://localhost:3333"

export default function OptionsPage() {
	const [step, setStep] = useState<Step>("choose")
	const [privateUrlInput, setPrivateUrlInput] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [auth, setAuth] = useState<StoredExtensionAuth | null>(null)
	const [pendingBaseUrl, setPendingBaseUrl] = useState<string | null>(null)
	const [switchInstance, setSwitchInstance] = useState(false)

	useEffect(() => {
		void getStoredAuth().then(setAuth)
	}, [])

	const onMessage = useCallback(
		(e: MessageEvent) => {
			if (e.data?.type !== EXTENSION_AUTH_MESSAGE || !e.data?.payload) {
				return
			}
			const base = pendingBaseUrl
			if (!base) {
				return
			}
			let expectedOrigin: string
			try {
				expectedOrigin = new URL(base).origin
			} catch {
				return
			}
			if (e.origin !== expectedOrigin) {
				return
			}
			const { apiToken, userId, instanceOrigin } = e.data.payload as {
				apiToken: string
				userId: string
				instanceOrigin: string
			}
			if (
				typeof apiToken !== "string" ||
				typeof userId !== "string" ||
				instanceOrigin !== expectedOrigin
			) {
				return
			}
			const next: StoredExtensionAuth = {
				instanceUrl: base,
				apiToken,
				userId
			}
			void setStoredAuth(next).then(() => {
				setAuth(next)
				setStep("done")
				setSwitchInstance(false)
				setPendingBaseUrl(null)
				setError(null)
			})
		},
		[pendingBaseUrl]
	)

	useEffect(() => {
		window.addEventListener("message", onMessage)
		return () => window.removeEventListener("message", onMessage)
	}, [onMessage])

	const startConnect = (baseUrl: string) => {
		const u = normalizeInstanceBaseUrl(baseUrl)
		if (!u) {
			setError("Invalid URL")
			return
		}
		setError(null)
		setPendingBaseUrl(u)
		setStep("connecting")
		const url = `${u}/extension/connect`
		const w = window.open(url, "_blank")
		if (!w) {
			setError("Popup blocked. Allow popups for this page.")
			setPendingBaseUrl(null)
			setStep("choose")
		}
	}

	const choosePublic = () => {
		startConnect(defaultPublicUrl)
	}

	const submitPrivate = () => {
		startConnect(privateUrlInput)
	}

	const disconnect = () => {
		void clearStoredAuth().then(() => {
			setAuth(null)
			setStep("choose")
		})
	}

	if (auth && step !== "connecting" && !switchInstance) {
		return (
			<div style={{ padding: 24, maxWidth: 480 }}>
				<h1 style={{ marginTop: 0 }}>MyLinks</h1>
				<p>Connected to {auth.instanceUrl}</p>
				<button type="button" onClick={disconnect}>
					Disconnect
				</button>
				<button
					type="button"
					onClick={() => {
						setSwitchInstance(true)
						setStep("choose")
					}}
					style={{ marginLeft: 12 }}>
					Connect to another instance
				</button>
			</div>
		)
	}

	return (
		<div style={{ padding: 24, maxWidth: 480 }}>
			<h1 style={{ marginTop: 0 }}>MyLinks</h1>
			{step === "choose" && (
				<>
					<p>Choose your MyLinks instance.</p>
					<button type="button" onClick={choosePublic}>
						Public instance ({defaultPublicUrl})
					</button>
					<button
						type="button"
						onClick={() => setStep("private-url")}
						style={{ marginLeft: 12 }}>
						Private instance
					</button>
				</>
			)}
			{step === "private-url" && (
				<>
					<label>
						Instance URL
						<input
							type="url"
							value={privateUrlInput}
							onChange={(e) => setPrivateUrlInput(e.target.value)}
							placeholder="https://links.example.com"
							style={{ display: "block", width: "100%", marginTop: 8 }}
						/>
					</label>
					<button type="button" onClick={submitPrivate} style={{ marginTop: 16 }}>
						Continue
					</button>
					<button
						type="button"
						onClick={() => setStep("choose")}
						style={{ marginLeft: 12 }}>
						Back
					</button>
				</>
			)}
			{step === "connecting" && (
				<p>
					Complete sign-in in the new tab, then click &quot;Authorize
					extension&quot;. This window must stay open.
				</p>
			)}
			{error && <p style={{ color: "crimson" }}>{error}</p>}
		</div>
	)
}
