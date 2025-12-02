# Signal OTP Service Integration Guide

This document explains how to use the OTP (One-Time Password) service integration with the Signal API.

## API Endpoints

The integration uses the following Signal API endpoints:

1. **Send OTP via Missed Call**: `POST https://transmitor.signalads.com/api/v1/otp/send`
2. **Send OTP via SMS (Retry)**: `POST https://transmitor.signalads.com/api/v1/otp/retry`
3. **Verify OTP**: `POST https://transmitor.signalads.com/api/v1/otp/verify`

## Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_API_TOKEN
```

For testing purposes, the token is hardcoded in the JavaScript files. You can find and replace `YOUR_TEST_API_TOKEN_HERE` in both `api.js` and `app.js` files.

## How to Test the OTP Service

### 1. Using the Test Page (test.html)

1. Open `test.html` in your browser
2. The API token is already set in the code, so no UI input is needed
3. Enter a phone number in the test form
4. Click "Start Missed Call Test" to send an OTP via missed call
5. After receiving the call, enter the last 4 digits of the caller's number
6. You can also switch to SMS verification if needed

### 2. Using the Direct API Test Page (test-direct-api.html)

1. Open `test-direct-api.html` in your browser
2. Enter a phone number
3. Click "Send Missed Call OTP" to test the missed call functionality
4. Click "Send SMS OTP" to test the SMS functionality

### 3. Manual Testing with cURL

You can also test the API directly with cURL:

```bash
# Send OTP via missed call
curl -X POST https://transmitor.signalads.com/api/v1/otp/send \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+989123456789", "method": "missed_call"}'

# Send OTP via SMS (retry)
curl -X POST https://transmitor.signalads.com/api/v1/otp/retry \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+989123456789", "method": "sms"}'

# Verify OTP
curl -X POST https://transmitor.signalads.com/api/v1/otp/verify \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+989123456789", "code": "1234"}'
```

## API Functions

The integration provides the following JavaScript functions in `api.js`:

### sendMissedCallOTP(phoneNumber)
Sends an OTP via missed call to the specified phone number.

```javascript
const response = await OTPService.sendMissedCallOTP('+989123456789');
if (response.success) {
  console.log('OTP sent successfully:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### sendSMSOTP(phoneNumber)
Sends an OTP via SMS to the specified phone number.

```javascript
const response = await OTPService.sendSMSOTP('+989123456789');
if (response.success) {
  console.log('SMS sent successfully:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### verifyOTP(phoneNumber, code)
Verifies the OTP code for the specified phone number.

```javascript
const response = await OTPService.verifyOTP('+989123456789', '1234');
if (response.success) {
  console.log('OTP verified successfully:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## Error Handling

All API functions return an object with a `success` property:
- If `success` is `true`, the `data` property contains the API response
- If `success` is `false`, the `error` property contains the error message

## Token Management

For testing purposes, the API token is hardcoded in the JavaScript files. In a production environment, you would want to implement proper token management.

## Supported Languages

The test interface supports three languages:
- Farsi (Persian)
- English
- Arabic

You can switch languages using the language selector in the header.