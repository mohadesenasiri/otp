# OTP Landing Page with Signal Integration

This is a complete OTP (One-Time Password) landing page with integration to Signal's OTP service. The project includes both frontend and backend components.

## Project Structure

```
.
├── backend/          # Backend proxy server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables (you need to configure this)
├── src/              # Frontend source files
│   ├── css/          # Stylesheets
│   ├── html/         # HTML files
│   ├── js/           # JavaScript files
│   ├── favicon.png   # Site favicon
│   └── a1a.png       # Hero image
├── package.json      # Root package file
└── README.md         # This file
```

## Setup Instructions

### 1. Configure Environment Variables

Before running the project, you need to configure the environment variables in `backend/.env`:

```env
SIGNAL_AUTH_TOKEN=your_signal_auth_token_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
API_KEY=your_secure_api_key_here
```

Replace the placeholder values with your actual Signal API credentials.

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Run the Project

```bash
# Run the project
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- API Endpoints: http://localhost:3001/api

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/token` - Generate JWT token
- `POST /api/send-missed-call` - Send OTP via missed call
- `POST /api/send-sms` - Send OTP via SMS
- `POST /api/verify` - Verify OTP code

## Development

For development with auto-restart on file changes:

```bash
npm run dev
```

## Features

- Multi-language support (Farsi, English, Arabic)
- Responsive design
- OTP testing interface
- Integration with Signal's OTP service
- Modern UI with animations
- Complete authentication flow

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Authentication: JWT
- API Integration: Signal OTP Service