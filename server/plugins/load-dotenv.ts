import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function loadDotEnv() {
  const envCandidates = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.output', '.env')
  ]
  const envPath = envCandidates.find((p) => existsSync(p))
  if (!envPath) {
    return
  }

  const lines = readFileSync(envPath, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

export default defineNitroPlugin(() => {
  loadDotEnv()
})
