import type { Transmit } from "@adonisjs/transmit-client"

const CHANNEL_TEMPLATES = [
  "collections/:userId/created",
  "collections/:userId/updated",
  "collections/:userId/deleted",
  "links/:userId/created",
  "links/:userId/updated",
  "links/:userId/deleted"
] as const

function channelForUser(template: (typeof CHANNEL_TEMPLATES)[number], userId: string) {
  return template.replace(":userId", userId)
}

export function subscribeUserTransmitChannels(transmit: Transmit, userId: string) {
  for (const template of CHANNEL_TEMPLATES) {
    const name = channelForUser(template, userId)
    const sub = transmit.subscription(name)
    void sub
      .create()
      .then(() => {
        sub.onMessage((payload) => {
          console.log("[transmit]", name, payload)
        })
      })
      .catch((err) => {
        console.error("[transmit] subscribe failed:", name, err)
      })
  }
}
