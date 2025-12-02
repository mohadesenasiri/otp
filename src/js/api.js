// API Integration for Signal OTP Service
const API_BASE_URL = '/api';

// Store JWT token in memory (in a real app, you might want to store it in localStorage)
let jwtToken = null;

// Function to set JWT token
function setJWTToken(token) {
  jwtToken = token;
}

// Function to get JWT token
function getJWTToken() {
  return jwtToken;
}

// Get API key from environment or use a default one
const API_KEY = 'my_secret_api_key_12345';

// Function to obtain JWT token
async function obtainJWTToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        client_id: 'web_client',
        client_secret: 'web_client_secret'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setJWTToken(data.token);
    return data.token;
  } catch (error) {
    console.error('Error obtaining JWT token:', error);
    throw error;
  }
}

// Send OTP via missed call
async function sendMissedCallOTP(phoneNumber) {
  try {
    // Ensure we have a valid JWT token
    if (!jwtToken) {
      await obtainJWTToken();
    }
    
    console.log('Sending missed call OTP request to:', `${API_BASE_URL}/send-missed-call`);
    console.log('Request body:', JSON.stringify({
      mobile: phoneNumber,
      pattern_id: 950
    }));
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/send-missed-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        mobile: phoneNumber,
        pattern_id: 950
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success response:', data);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error sending missed call OTP:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'زمان اتصال به سرور به پایان رسید. لطفاً دوباره تلاش کنید.'
      };
    }
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'خطا در ارسال تماس بی‌پاسخ'
    };
  }
}

// Verify OTP
async function verifyOTP(uuid, code) {
  try {
    console.log('Verifying OTP request to:', `${API_BASE_URL}/verify`);
    console.log('Verify request body:', JSON.stringify({
      uuid: uuid,
      code: code
    }));
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        uuid: uuid,
        code: code
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('Verify Response status:', response.status);
    console.log('Verify Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Verify API Error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Verify Success response:', data);
    
    // Check if the verification was actually successful
    // The Signal API likely returns a success field or similar in the response data
    const isVerificationSuccess = data.success || data.verified || data.valid || 
                                 (data.status && data.status === 'success') || 
                                 (data.result && data.result.success) ||
                                 false;
    
    return {
      success: isVerificationSuccess,
      data: data,
      error: isVerificationSuccess ? null : (data.message || data.error || 'Verification failed')
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'زمان اتصال به سرور به پایان رسید. لطفاً دوباره تلاش کنید.'
      };
    }
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'خطا در تأیید کد'
    };
  }
}

// Export functions
window.OTPService = {
  sendMissedCallOTP,
  verifyOTP,
  setJWTToken,
  getJWTToken
};