import { registry } from "@mylinks/webapp/registry"
import { createTuyau } from "@tuyau/core/client"

const DEFAULT_URL = "http://localhost:3333"

const apiUrl = import.meta.env?.VITE_API_URL ?? DEFAULT_URL

export const client = createTuyau({
  baseUrl: apiUrl,
  registry,
  headers: { Accept: "application/json" },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("auth_token")
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      }
    ]
  }
})
