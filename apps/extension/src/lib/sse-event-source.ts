const EVENT_STREAM = "text/event-stream"
const DEFAULT_RETRY_MS = 1000

type SseParseState = { eventType: string; dataLines: string[] }

function emitParsedEvent(
  state: SseParseState,
  onData: (eventType: string, data: string) => void
) {
  if (state.dataLines.length > 0) {
    onData(state.eventType, state.dataLines.join("\n"))
  }
  state.eventType = "message"
  state.dataLines = []
}

function consumeSseLine(
  line: string,
  state: SseParseState,
  onData: (eventType: string, data: string) => void
) {
  if (line === "") {
    emitParsedEvent(state, onData)
    return
  }
  if (line.startsWith(":")) {
    return
  }
  const colon = line.indexOf(":")
  const field = colon === -1 ? line : line.slice(0, colon)
  let value = colon === -1 ? "" : line.slice(colon + 1)
  if (value.startsWith(" ")) {
    value = value.slice(1)
  }
  if (field === "event") {
    state.eventType = value
  } else if (field === "data") {
    state.dataLines.push(value)
  }
}

async function drainSseBody(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
  onData: (eventType: string, data: string) => void
) {
  const decoder = new TextDecoder()
  let carry = ""
  const state: SseParseState = { eventType: "message", dataLines: [] }

  while (!signal.aborted) {
    const chunk = await reader.read()
    if (chunk.done) {
      emitParsedEvent(state, onData)
      return
    }
    carry += decoder.decode(chunk.value, { stream: true })
    const lines = carry.split(/\r?\n/)
    carry = lines.pop() ?? ""
    for (const line of lines) {
      consumeSseLine(line, state, onData)
    }
  }
}

async function connectSseSession(
  url: string,
  extraHeaders: Record<string, string>,
  credentials: RequestCredentials,
  signal: AbortSignal,
  emit: (type: string, data?: string) => void
) {
  const response = await fetch(url, {
    headers: { Accept: EVENT_STREAM, ...extraHeaders },
    credentials,
    signal
  })
  if (!response.ok) {
    throw new Error(`SSE HTTP ${response.status}`)
  }
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes(EVENT_STREAM)) {
    throw new Error(`SSE expected ${EVENT_STREAM}, got ${contentType || "none"}`)
  }
  const body = response.body
  if (!body) {
    throw new Error("SSE response has no body")
  }
  emit("open")
  await drainSseBody(body.getReader(), signal, (eventType, data) => {
    emit(eventType, data)
  })
}

function sleep(ms: number, signal: AbortSignal) {
  if (signal.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"))
  }
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(t)
      signal.removeEventListener("abort", onAbort)
      reject(new DOMException("Aborted", "AbortError"))
    }
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal.addEventListener("abort", onAbort)
  })
}

export function createSseEventSource(
  url: string | URL,
  options: { withCredentials: boolean },
  headers: Record<string, string>,
  retryMs = DEFAULT_RETRY_MS
): EventSource {
  const controller = new AbortController()
  const listeners = new Map<string, Set<(event: MessageEvent) => void>>()

  const emit = (type: string, data?: string) => {
    const evt = new MessageEvent(type, { data })
    listeners.get(type)?.forEach((fn) => fn(evt))
  }

  const urlString = typeof url === "string" ? url : url.toString()
  const credentials: RequestCredentials = options.withCredentials ? "include" : "omit"

  void (async () => {
    const { signal } = controller
    while (!signal.aborted) {
      try {
        await connectSseSession(urlString, headers, credentials, signal, emit)
      } catch (e) {
        if (signal.aborted || (e instanceof DOMException && e.name === "AbortError")) {
          break
        }
      }
      if (signal.aborted) {
        break
      }
      emit("error")
      try {
        await sleep(retryMs, signal)
      } catch {
        break
      }
    }
  })()

  return {
    addEventListener(type: string, listener: (event: MessageEvent) => void) {
      let set = listeners.get(type)
      if (!set) {
        set = new Set()
        listeners.set(type, set)
      }
      set.add(listener)
    },
    removeEventListener(type: string, listener: (event: MessageEvent) => void) {
      listeners.get(type)?.delete(listener)
    },
    close() {
      controller.abort()
    }
  } as EventSource
}
