interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly PLASMO_PUBLIC_API_URL?: string
  readonly PLASMO_PUBLIC_API_TOKEN?: string
  readonly PLASMO_PUBLIC_TRANSMIT_USER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

