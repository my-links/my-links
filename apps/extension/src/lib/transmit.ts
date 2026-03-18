import { Transmit } from "@adonisjs/transmit-client"

import { apiBearerToken, apiUrl } from "~lib/constants"
import { createSseEventSource } from "~lib/sse-event-source"

type TransmitHttpClientShape = {
  send(request: Request): Promise<Response>
  createRequest(path: string, body: Record<string, unknown>): Request
}

function bearerAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function createBearerHttpClient(
  baseUrl: string,
  uid: string,
  token: string
): TransmitHttpClientShape {
  const auth = bearerAuthHeader(token)
  return {
    send: (request) => fetch(request),
    createRequest(path, body) {
      return new Request(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth
        },
        body: JSON.stringify({ uid, ...body })
      })
    }
  }
}

export function createTransmitClient(bearerToken: string) {
  const auth = bearerAuthHeader(bearerToken)
  return new Transmit({
    baseUrl: apiUrl,
    httpClientFactory: (baseUrl, uid) =>
      createBearerHttpClient(baseUrl, uid, bearerToken) as never,
    eventSourceFactory: (url, options) =>
      createSseEventSource(url, options, auth)
  })
}

export function getTransmitClient(): Transmit | null {
  const token = apiBearerToken.trim()
  if (!token) {
    return null
  }
  return createTransmitClient(token)
}
