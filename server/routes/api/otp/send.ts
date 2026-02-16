import { setResponseHeader, setResponseStatus } from 'h3'
import {
  callUpstream,
  normalizeIranianMobile,
  readJsonBody,
  setCorsHeaders
} from '../../../utils/otp'

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

  const mobile = normalizeIranianMobile(body.mobile)
  if (!mobile) {
    setResponseStatus(event, 400)
    return { success: false, message: 'Invalid mobile number' }
  }

  const defaultPatternId = Number(process.env.OTP_PATTERN_ID || 950)
  const patternId = Number(body.pattern_id || defaultPatternId)

  const result = await callUpstream('/otp/send', {
    mobile,
    pattern_id: Number.isFinite(patternId) ? patternId : defaultPatternId
  })

  setResponseStatus(event, result.status)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  return result.body
})
