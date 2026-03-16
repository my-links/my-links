import { client } from "~lib/tuyau"

client
  .get("/api/v1/health", {})
  .then((response) => {
    console.log("Search results health:", response)
  })
  .catch((error) => {
    console.error("Error fetching health results:", error)
  })

client
  .get("/", {})
  .then((response) => {
    console.log("Search results home:", response)
  })
  .catch((error) => {
    console.error("Error fetching home results:", error)
  })
