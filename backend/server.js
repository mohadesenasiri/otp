require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '..', 'src')));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Authentication token - should be stored in environment variables for security
const AUTH_TOKEN = process.env.SIGNAL_AUTH_TOKEN

const API_BASE_URL = 'https://transmitor.signalads.com';

// JWT Secret - should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// API Key for authentication
const API_KEY = process.env.API_KEY

// Middleware to check for valid API key
const authenticateRequest = (req, res, next) => {
  // Skip API key check for endpoints that require JWT authentication
  const jwtEndpoints = ['/send-missed-call', '/send-sms', '/verify'];
  if (jwtEndpoints.includes(req.path)) {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid API key' });
  }
  next();
};

// Apply authentication middleware to all API routes
app.use('/api', authenticateRequest);

// Generate JWT token endpoint
app.post('/api/auth/token', (req, res) => {
  try {
    const { client_id, client_secret } = req.body;
    
    // In a real implementation, you would validate client credentials
    // against a database of registered clients
    if (!client_id || !client_secret) {
      return res.status(400).json({ 
        success: false, 
        error: 'client_id and client_secret are required' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { client_id, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({ 
      success: true, 
      token,
      expires_in: JWT_EXPIRES_IN
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error generating token' 
    });
  }
});

// Middleware to validate JWT token
const validateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    console.log('JWT validation - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT validation - Token decoded:', decoded);
    req.client = decoded; // Add client info to request
    next();
  } catch (error) {
    console.log('JWT validation error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid access token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token expired' 
      });
    }
    
    console.error('Error validating token:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error validating token' 
    });
  }
};

// Send OTP via missed call (requires JWT authentication)
app.post('/api/send-missed-call', validateJWT, async (req, res) => {
  try {
    const { mobile, pattern_id } = req.body;
    
    console.log('Using AUTH_TOKEN:', AUTH_TOKEN ? 'Set' : 'Not set');
    console.log('Sending request to:', `${API_BASE_URL}/api_v1/otp/send`);
    
    console.log('Sending OTP request with:', { mobile, pattern_id: pattern_id || 950 });
    
    const response = await fetch(`${API_BASE_URL}/api_v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        mobile,
        pattern_id: pattern_id || 950
      })
    });

    const data = await response.json();
    console.log('Signal API response:', response.status, data);
    
    if (!response.ok) {
      console.log('Signal API error response:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.message || `Signal API error! status: ${response.status}, data: ${JSON.stringify(data)} ${AUTH_TOKEN}}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending missed call OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'خطا در ارسال تماس بی‌پاسخ' 
    });
  }
});

// Verify OTP (requires JWT authentication)
app.post('/api/verify', validateJWT, async (req, res) => {
  try {
    const { uuid, code } = req.body;
    
    console.log('Verifying OTP with:', { uuid, code });
    
    const response = await fetch(`${API_BASE_URL}/api_v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        uuid,
        code
      })
    });

    const data = await response.json();
    console.log('Verify API response:', response.status, data);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: data.message || `HTTP error! status: ${response.status}` 
      });
    }

    // Check if the verification was actually successful
    // The Signal API likely returns a success field or similar in the response data
    const isVerificationSuccess = data.success || data.verified || data.valid || 
                                 (data.status && data.status === 'success') || 
                                 (data.result && data.result.success) ||
                                 false;
    
    res.json({ 
      success: isVerificationSuccess, 
      data,
      error: isVerificationSuccess ? null : (data.message || data.error || 'Verification failed')
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'خطا در تأیید کد' 
    });
  }
});

// Serve the main index.html file for all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'html', 'index.html'));
});

// Serve other HTML files
app.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'html', 'test.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});