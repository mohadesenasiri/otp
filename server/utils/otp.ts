import { readRawBody, type H3Event } from 'h3'

export function finiteNumberOr(value: string | undefined, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function setCorsHeaders(event: H3Event) {
  event.node.res.setHeader('Access-Control-Allow-Origin', '*')
  event.node.res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
}

export function normalizeDigits(value: unknown) {
  return String(value || '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
}

export function normalizeIranianMobile(input: unknown) {
  let digits = normalizeDigits(input).replace(/\D/g, '')

  if (digits.startsWith('0098')) {
    digits = digits.slice(4)
  } else if (digits.startsWith('98')) {
    digits = digits.slice(2)
  }

  if (digits.length === 11 && digits.startsWith('09')) {
    return digits
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    return `0${digits}`
  }

  return null
}

export async function readJsonBody(event: Parameters<typeof readRawBody>[0]) {
  const raw = await readRawBody(event, 'utf-8')
  if (!raw) {
    return {}
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function callUpstream(endpoint: string, payload: Record<string, unknown>) {
  const apiBaseUrl = process.env.OTP_API_BASE_URL || 'https://transmitor.signalads.com/api_v1'
  const apiToken = process.env.OTP_API_TOKEN || process.env.SIGNAL_AUTH_TOKEN

  if (!apiToken) {
    return {
      status: 500,
      body: { success: false, message: 'Server auth token is not configured' }
    }
  }

  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = { success: false, message: 'Invalid upstream response', raw: text }
    }

    return { status: response.status, body: data }
  } catch {
    return {
      status: 502,
      body: { success: false, message: 'Cannot reach upstream OTP API' }
    }
  }
}
