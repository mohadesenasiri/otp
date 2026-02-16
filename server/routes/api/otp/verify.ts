import { setResponseHeader, setResponseStatus } from 'h3'
import { callUpstream, normalizeDigits, readJsonBody, setCorsHeaders } from '../../../utils/otp'

export default defineEventHandler(async (event) => {
  setCorsHeaders(event)

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }

  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { success: false, message: 'Method Not Allowed' }
  }

  const body = await readJsonBody(event)
  if (body === null) {
    setResponseStatus(event, 400)
    return { success: false, message: 'Invalid JSON body' }
  }

  const otpUuid = String(body.otp_uuid || body.uuid || '').trim()
  const code = normalizeDigits(String(body.code || '')).replace(/\D/g, '')

  if (!otpUuid || !code) {
    setResponseStatus(event, 400)
    return { success: false, message: 'otp_uuid and code are required' }
  }

  const result = await callUpstream('/otp/verify', {
    uuid: otpUuid,
    code
  })

  setResponseStatus(event, result.status)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  return result.body
})
