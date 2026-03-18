export type Broadcastable =
	| { [key: string]: Broadcastable }
	| string
	| number
	| boolean
	| null
	| Broadcastable[];

export function toBroadcastable<T>(payload: T): Broadcastable {
	return structuredClone(payload) as Broadcastable;
}
