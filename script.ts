import { createWebhookObjectClient, secretFromEnv } from "@gathertown/webhook-object-sdk"
import "dotenv/config"

const inbox = createWebhookObjectClient({
  url: "https://api.v2.gather.town/api/v2/hooks/spaces/5d950ebd-914e-45fb-8499-3830121d4cac/objects/149a76b0-7fa1-471c-bd7d-d96a9e3ccc37",
  secret: secretFromEnv("GATHER_WEBHOOK_SECRET"),
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MAX = 5
const INTERVAL = 3000
const nodeProcess = (globalThis as typeof globalThis & {
  process: {
    on(signal: string, listener: () => void | Promise<void>): void
    exit(code?: number): never
  }
}).process

async function main() {
  await inbox.ping()

  let count = 0
  let direction = 1
  await inbox.send("counter.set", { count: 0 })

  nodeProcess.on("SIGINT", async () => {
    await inbox.counter.reset()
    nodeProcess.exit(0)
  })

  while (true) {
    if (count >= MAX) direction = -1
    if (count <= 0) direction = 1

    if (direction === 1) await inbox.send("counter.increment", { by: 1 })
    else await inbox.send("counter.decrement", { by: 1 })

    count += direction
    await sleep(INTERVAL)
  }
}

main().catch((err) => {
  console.error(err)
  nodeProcess.exit(1)
})