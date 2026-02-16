import { finiteNumberOr } from '../utils/otp'

export default defineEventHandler((event) => {
  const cfg = {
    missedCallUnitPrice: finiteNumberOr(process.env.OTP_CALC_MISSED_CALL_UNIT_PRICE, 73),
    smsUnitPriceMin: finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_MIN, 140),
    smsUnitPriceMax: finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_MAX, 300),
    smsUnitPriceDefault: finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_DEFAULT, 180),
    smsUnitPriceStep: finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_STEP, 10)
  }

  event.node.res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
  event.node.res.setHeader('Cache-Control', 'no-store')
  return `window.__OTP_CALC_CONFIG__ = ${JSON.stringify(cfg)};\n`
})
