# OTP Backend Proxy Server

This is a simple Node.js proxy server that securely handles the Signal OTP API requests, keeping the authentication token on the backend where it cannot be accessed from the frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## How it works

- The server runs on port 3001
- It securely stores the authentication token
- It proxies requests from the frontend to the Signal API
- The frontend no longer has access to the authentication token

## API Endpoints

- `POST /api/send-missed-call` - Send OTP via missed call
- `POST /api/send-sms` - Send OTP via SMS (retry)
- `POST /api/verify` - Verify OTP code

All endpoints expect the same parameters as the original Signal API.