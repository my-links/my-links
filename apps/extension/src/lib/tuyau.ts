import { registry } from "@mylinks/webapp/registry"
import { createTuyau } from "@tuyau/core/client"

import { apiBearerToken, apiUrl } from "~lib/constants"

const jsonHeaders: Record<string, string> = { Accept: "application/json" }
const token = apiBearerToken.trim()
if (token) {
  jsonHeaders.Authorization = `Bearer ${token}`
}

export const client = createTuyau({
  baseUrl: apiUrl,
  registry,
  headers: jsonHeaders
})
