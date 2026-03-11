#!/usr/bin/env node
/**
 * Sangam.ai — Supabase migration runner
 * Uses Supabase Management API (no pg/psql needed)
 *
 * Setup (once):
 *   1. Go to https://app.supabase.com/account/tokens
 *   2. Generate a new access token
 *   3. Add to .env.local:  SUPABASE_ACCESS_TOKEN=sbp_xxx...
 *
 * Usage:  node scripts/migrate.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')

// Load .env.local
const envPath = join(ROOT, '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#') && !process.env[k.trim()]) {
      process.env[k.trim()] = v.join('=').trim()
    }
  }
}

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL   // https://xxx.supabase.co
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!PROJECT_URL || !SERVICE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

// Extract project ref from URL:  https://cybzfefxfikhdtfaeooz.supabase.co
const PROJECT_REF = PROJECT_URL.replace('https://', '').split('.')[0]

async function runSql(sql) {
  if (ACCESS_TOKEN) {
    // Path 1: Management API (preferred — supports DDL)
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Management API error ${res.status}: ${err}`)
    }
    return await res.json()
  } else {
    // Path 2: REST RPC (limited — won't work for DDL like ALTER TABLE / CREATE POLICY)
    // This path is a fallback that will likely fail for schema migrations
    const res = await fetch(`${PROJECT_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`REST error ${res.status}: ${err}\n\n⚠️  Add SUPABASE_ACCESS_TOKEN to .env.local for full DDL support.\nGet it from: https://app.supabase.com/account/tokens`)
    }
    return await res.json()
  }
}

async function getAppliedMigrations() {
  try {
    const res = await fetch(`${PROJECT_URL}/rest/v1/schema_migrations?select=version&order=version`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    })
    if (!res.ok) return new Set()
    const rows = await res.json()
    return new Set((rows ?? []).map(r => r.version))
  } catch {
    return new Set()
  }
}

async function ensureMigrationsTable() {
  const sql = `
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz default now()
    );
  `
  await runSql(sql)
}

async function markApplied(version) {
  const res = await fetch(`${PROJECT_URL}/rest/v1/schema_migrations`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({ version }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to mark migration applied: ${err}`)
  }
}

async function main() {
  console.log(`\n🚀  Sangam.ai migration runner`)
  console.log(`    Project: ${PROJECT_REF}`)
  console.log(`    Auth:    ${ACCESS_TOKEN ? '✓ Management API token' : '⚠️  No access token — DDL may fail (add SUPABASE_ACCESS_TOKEN)'}`)

  const migrationsDir = join(ROOT, 'supabase', 'migrations')
  if (!existsSync(migrationsDir)) {
    console.log('\n✓  No migrations directory found.')
    return
  }

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('\n✓  No migration files found.')
    return
  }

  await ensureMigrationsTable()
  const applied = await getAppliedMigrations()

  const pending = files.filter(f => !applied.has(f.replace('.sql', '')))

  if (pending.length === 0) {
    console.log(`\n✓  All ${files.length} migration(s) already applied. Nothing to do.\n`)
    return
  }

  console.log(`\n    ${applied.size} already applied, ${pending.length} pending:\n`)

  let ok = 0
  let failed = 0

  for (const file of pending) {
    const version = file.replace('.sql', '')
    const sql = readFileSync(join(migrationsDir, file), 'utf8').trim()
    process.stdout.write(`    ▸ ${file} … `)
    try {
      await runSql(sql)
      await markApplied(version)
      console.log('✓')
      ok++
    } catch (err) {
      console.log('✗')
      console.error(`\n      Error: ${err.message}\n`)
      failed++
      // Continue with remaining migrations
    }
  }

  console.log(`\n    Applied: ${ok}  Failed: ${failed}\n`)
  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('\n❌  Fatal:', err.message)
  process.exit(1)
})
