const API_BASE_CANDIDATES = (() => {
  return ['/api/otp', 'http://127.0.0.1:3000/api/otp', 'http://localhost:3000/api/otp'];
})();
const API_PATTERN_ID = 950;

async function safeParseResponse(response) {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {
      message: 'پاسخ نامعتبر از سرور',
      raw
    };
  }
}

function normalizeApiError(response, data, fallbackMessage) {
  if (response.status === 404 || response.status === 405) {
    return window.location.port === '5500'
      ? 'سرور API روی پورت 3000 فعال نیست.'
      : 'API داخلی فعال نیست. پروژه را با سرور امن اجرا کنید.';
  }
  return data.message || fallbackMessage;
}

async function postWithFallback(path, payload) {
  let lastError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await safeParseResponse(response);
      if (!response.ok && (response.status === 404 || response.status === 405)) {
        lastError = new Error(`API candidate rejected (${response.status}) at ${baseUrl}`);
        continue;
      }
      return { response, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('API is unreachable');
}

async function sendOTP(phoneNumber) {
  const { response, data } = await postWithFallback('/send', {
    mobile: phoneNumber,
    pattern_id: API_PATTERN_ID
  });

  if (!response.ok) {
    return {
      success: false,
      error: normalizeApiError(response, data, 'خطا در ارسال OTP')
    };
  }

  return {
    success: true,
    data: data
  };
}

async function verifyOTP(uuid, code) {
  const { response, data } = await postWithFallback('/verify', {
    // Server accepts both `uuid` and `otp_uuid`, but upstream docs use `uuid`.
    uuid: uuid,
    code: code
  });

  if (!response.ok) {
    return {
      success: false,
      error: normalizeApiError(response, data, 'خطا در تأیید کد')
    };
  }

  return {
    success: true,
    data: data
  };
}

window.OTPService = {
  sendOTP,
  verifyOTP
};
