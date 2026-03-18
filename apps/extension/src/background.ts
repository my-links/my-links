import { transmitDefaultUserId } from "~lib/constants"
import { getTransmitClient } from "~lib/transmit"
import { subscribeUserTransmitChannels } from "~lib/transmit-subscriptions"
import { client } from "~lib/tuyau"

void (async () => {
  try {
    const health = await client.get("/api/v1/health", {})
    console.log("[health]", health)
  } catch (e) {
    console.error("[health]", e)
  }

  const transmit = getTransmitClient()
  if (transmit) {
    subscribeUserTransmitChannels(transmit, transmitDefaultUserId)
  } else {
    console.warn("[transmit] skipped: set PLASMO_PUBLIC_API_TOKEN")
  }
})()
