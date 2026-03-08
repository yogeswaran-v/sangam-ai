import { supabase } from '../lib/supabase'
import { notifyCustomer } from '../lib/notify'

// Dynamic import to avoid failing at startup when dockerode isn't installed yet
async function getDocker() {
  try {
    const Dockerode = (await import('dockerode')).default
    return new Dockerode()
  } catch {
    throw new Error('dockerode not installed — run npm install in services/orchestrator/')
  }
}

const ORCHESTRATOR_IMAGE = process.env.ORCHESTRATOR_IMAGE ?? 'sangam-orchestrator:latest'

export async function provisionCustomerContainer(customerId: string): Promise<string> {
  const docker = await getDocker()

  // Check if container already exists
  const { data: customer } = await supabase
    .from('customers')
    .select('docker_container_id, docker_status')
    .eq('id', customerId)
    .single()

  if (customer?.docker_container_id) {
    console.log(`Container already exists for customer ${customerId}: ${customer.docker_container_id}`)
    return customer.docker_container_id
  }

  // Update status to provisioning
  await supabase
    .from('customers')
    .update({ docker_status: 'provisioning' })
    .eq('id', customerId)

  try {
    const container = await docker.createContainer({
      Image: ORCHESTRATOR_IMAGE,
      name: `sangam-customer-${customerId}`,
      Env: [
        `CUSTOMER_ID=${customerId}`,
        `SUPABASE_URL=${process.env.SUPABASE_URL}`,
        `SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`,
        `TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN ?? ''}`,
        `POLL_INTERVAL_MS=${process.env.POLL_INTERVAL_MS ?? '30000'}`,
      ],
      HostConfig: {
        RestartPolicy: { Name: 'unless-stopped' },
        Memory: 512 * 1024 * 1024, // 512MB
        NanoCpus: 500_000_000, // 0.5 CPU
      },
    })

    await container.start()
    const containerId = container.id

    // Persist container ID
    await supabase
      .from('customers')
      .update({ docker_container_id: containerId, docker_status: 'running' })
      .eq('id', customerId)

    await notifyCustomer(customerId, `✅ *Your AI team is online!*\n\nYour agent container is now running. Agents will begin working on your mission shortly.`)

    console.log(`✓ Container provisioned for customer ${customerId}: ${containerId}`)
    return containerId
  } catch (err) {
    await supabase
      .from('customers')
      .update({ docker_status: 'stopped' })
      .eq('id', customerId)
    throw err
  }
}

export async function stopCustomerContainer(customerId: string): Promise<void> {
  const docker = await getDocker()

  const { data: customer } = await supabase
    .from('customers')
    .select('docker_container_id')
    .eq('id', customerId)
    .single()

  if (!customer?.docker_container_id) return

  try {
    const container = docker.getContainer(customer.docker_container_id)
    await container.stop()
    await supabase
      .from('customers')
      .update({ docker_status: 'stopped' })
      .eq('id', customerId)
    console.log(`✓ Container stopped for customer ${customerId}`)
  } catch (err) {
    console.error(`Error stopping container for ${customerId}:`, err)
  }
}

export async function getContainerStatus(customerId: string): Promise<string> {
  const docker = await getDocker()

  const { data: customer } = await supabase
    .from('customers')
    .select('docker_container_id')
    .eq('id', customerId)
    .single()

  if (!customer?.docker_container_id) return 'not_provisioned'

  try {
    const container = docker.getContainer(customer.docker_container_id)
    const info = await container.inspect()
    return info.State.Running ? 'running' : 'stopped'
  } catch {
    return 'unknown'
  }
}
