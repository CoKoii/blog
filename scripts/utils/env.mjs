import fs from 'node:fs'
import path from 'node:path'

const parseEnvLine = (line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1) return null
  const key = trimmed.slice(0, eqIndex).trim()
  let value = trimmed.slice(eqIndex + 1).trim()
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  return key ? [key, value] : null
}

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line)
    if (!parsed) continue
    const [key, value] = parsed
    env[key] = value
  }
  return env
}

export const loadEnv = (rootDir = process.cwd()) => {
  const envFiles = [
    path.join(rootDir, '.env'),
    path.join(rootDir, '.env.local'),
    path.join(rootDir, '.env.production'),
    path.join(rootDir, '.env.production.local'),
  ]

  const env = {}
  for (const envPath of envFiles) {
    Object.assign(env, readEnvFile(envPath))
  }

  return { ...env, ...process.env }
}
