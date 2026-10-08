import { createWebhookObjectClient, secretFromEnv } from "@gathertown/webhook-object-sdk"
import "dotenv/config"

const nodeProcess = (globalThis as typeof globalThis & {
  process: {
    env: Record<string, string | undefined>
    on(signal: string, listener: () => void | Promise<void>): void
    exit(code?: number): never
  }
}).process

const OBJECT_COUNT = 3

function makeInbox(n: number) {
  const url = nodeProcess.env[`GATHER_URL_${n}`]
  if (!url) throw new Error(`Falta GATHER_URL_${n} no .env`)
  return createWebhookObjectClient({ url, secret: secretFromEnv(`GATHER_SECRET_${n}`) })
}

type Inbox = ReturnType<typeof makeInbox>

const inboxes: Inbox[] = Array.from({ length: OBJECT_COUNT }, (_, i) => makeInbox(i + 1))

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MAX = 5
const INTERVAL = 5000

async function runInbox(inbox: Inbox, index: number) {
  await sleep(index * 1500)
  await inbox.ping()

  let count = 0
  let direction = 1
  await inbox.send("counter.set", { count: 0 })

  while (true) {
    if (count >= MAX) direction = -1
    if (count <= 0) direction = 1

    if (direction === 1) await inbox.send("counter.increment", { by: 1 })
    else await inbox.send("counter.decrement", { by: 1 })

    count += direction
    await sleep(INTERVAL + Math.random() * 3000)
  }
}

async function main() {
  nodeProcess.on("SIGINT", async () => {
    await Promise.all(inboxes.map((i) => i.counter.reset()))
    nodeProcess.exit(0)
  })

  await Promise.all(inboxes.map(runInbox))
}

main().catch((err) => {
  console.error(err)
  nodeProcess.exit(1)
})