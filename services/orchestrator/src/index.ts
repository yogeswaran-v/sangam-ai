import 'dotenv/config'
import { runOrchestrationCycle } from './orchestrator'

const INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '30000', 10)

async function main() {
  console.log('Sangam Orchestrator starting...')
  console.log(`Poll interval: ${INTERVAL_MS}ms`)

  // Run immediately on start
  await runOrchestrationCycle()

  // Then poll on interval
  setInterval(async () => {
    await runOrchestrationCycle()
  }, INTERVAL_MS)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
