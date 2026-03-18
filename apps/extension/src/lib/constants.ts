export const DEFAULT_URL = "http://localhost:3333"

export const apiUrl =
  import.meta.env.PLASMO_PUBLIC_API_URL ??
  import.meta.env.VITE_API_URL ??
  DEFAULT_URL

export const apiBearerToken = import.meta.env.PLASMO_PUBLIC_API_TOKEN ?? ""

export const transmitDefaultUserId =
  import.meta.env.PLASMO_PUBLIC_TRANSMIT_USER_ID ?? "1"
