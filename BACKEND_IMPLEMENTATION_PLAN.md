# FinPro Backend Integration Plan

Complete roadmap for adding database, authentication, and server infrastructure.

---

## 🎯 Architecture Overview

### Before (Current - Standalone)
```
Browser
  ↓
cam-website.html (all logic client-side)
  ↓
localStorage (data stays in browser)
```

### After (Full-Stack)
```
Frontend (Vercel)             Backend (Vercel Serverless)       Database (PostgreSQL)
   ↓                              ↓                              ↓
HTML/CSS/JS          →  Node.js/Express API  ←→  PostgreSQL DB
(cam-website.html)    (api/auth, api/assessments)  (users, assessments, data)
                      
User Registration  →  /api/auth/signup       →  Store user
User Login        →  /api/auth/sendOtp       →  Twilio OTP
Verify OTP        →  /api/auth/verifyOtp     →  Create session
Save Assessment   →  /api/assessments/save   →  Store in DB
Get Assessment    →  /api/assessments/get    →  Retrieve from DB
```

---

## 📋 Implementation Phases

### Phase 1: Project Setup (30 minutes)
- [ ] Create Node.js project structure
- [ ] Install dependencies (Express, PostgreSQL client, JWT, dotenv)
- [ ] Create environment configuration
- [ ] Set up basic Express server

### Phase 2: Database Setup (45 minutes)
- [ ] Create PostgreSQL database
- [ ] Create tables (users, assessments, sessions)
- [ ] Set up database connection
- [ ] Test database connectivity

### Phase 3: Authentication (1.5 hours)
- [ ] Implement signup endpoint
- [ ] Integrate Twilio OTP service
- [ ] Implement OTP verification
- [ ] Create JWT token generation
- [ ] Implement login session management

### Phase 4: Assessment API (1 hour)
- [ ] Create endpoints for saving assessments
- [ ] Create endpoints for retrieving assessments
- [ ] Implement data validation
- [ ] Add error handling

### Phase 5: Frontend Updates (1 hour)
- [ ] Replace localStorage with API calls
- [ ] Update login/signup UI
- [ ] Add OTP verification screen
- [ ] Update assessment saving logic

### Phase 6: Deployment (30 minutes)
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Deploy backend (serverless functions)
- [ ] Deploy frontend
- [ ] Test end-to-end

---

## 🏗️ Project Structure

```
finpro-backend/
├── api/
│   ├── auth.js                 # Signup, login, OTP
│   └── assessments.js          # Save/retrieve assessments
├── db/
│   ├── config.js              # PostgreSQL connection
│   └── schema.sql             # Database schema
├── middleware/
│   └── auth.js                # JWT verification
├── services/
│   └── twilio.js              # OTP service
├── utils/
│   └── jwt.js                 # Token generation
├── vercel.json                # Vercel serverless config
├── .env.example               # Environment variables template
└── package.json

finpro-frontend/
├── cam-website.html           # Updated to call API
├── js/
│   ├── api-client.js          # API communication
│   ├── auth.js                # Authentication logic
│   └── storage.js             # Replace localStorage
└── styles/
    └── main.css               # Updated as needed
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  customer_type VARCHAR(20) CHECK (customer_type IN ('company', 'individual')),
  phone_number VARCHAR(20),
  otp_secret VARCHAR(255),
  otp_expires_at TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Assessments Table
```sql
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  customer_type VARCHAR(20),
  financial_metrics JSONB,
  loan_requirement JSONB,
  assessment_results JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Multi-Year Financials Table
```sql
CREATE TABLE multi_year_financials (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
  financial_year VARCHAR(20),
  p_and_l JSONB,
  balance_sheet JSONB,
  source_files TEXT[],
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication Flow

### Signup
```
User enters: Email, Password, Name, Type (Company/Individual)
     ↓
POST /api/auth/signup
     ↓
Validate email not exists
     ↓
Hash password
     ↓
Create user in database
     ↓
Send OTP via Twilio
     ↓
Return: { userId, message: "OTP sent to email" }
```

### Login with OTP
```
User enters: Email
     ↓
POST /api/auth/sendOtp
     ↓
Find user by email
     ↓
Generate 6-digit OTP
     ↓
Store OTP + expiry (5 mins) in database
     ↓
Send OTP via Twilio SMS/Email
     ↓
Return: { userId, message: "OTP sent" }
     ↓
User enters: OTP
     ↓
POST /api/auth/verifyOtp
     ↓
Verify OTP matches & not expired
     ↓
Generate JWT token
     ↓
Create session
     ↓
Return: { token, user: {...} }
```

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/signup
  Input: { email, password, fullName, customerType, phone }
  Output: { userId, message }

POST /api/auth/sendOtp
  Input: { email }
  Output: { userId, message }

POST /api/auth/verifyOtp
  Input: { userId, otp }
  Output: { token, user: { id, email, fullName, customerType } }

POST /api/auth/logout
  Input: { token }
  Output: { message }

GET /api/auth/profile
  Input: Authorization: Bearer {token}
  Output: { user: { id, email, fullName, customerType, createdAt } }
```

### Assessment Endpoints
```
POST /api/assessments
  Input: { token, customerType, financialMetrics, loanRequirement, assessmentResults }
  Output: { assessmentId, message }

GET /api/assessments/:id
  Input: Authorization: Bearer {token}
  Output: { assessment: { id, customerType, financialMetrics, loanRequirement, results } }

GET /api/assessments
  Input: Authorization: Bearer {token}
  Output: { assessments: [...] }

PUT /api/assessments/:id
  Input: { token, ...updatedData }
  Output: { assessmentId, message }

DELETE /api/assessments/:id
  Input: Authorization: Bearer {token}
  Output: { message }
```

### Multi-Year Financial Endpoints
```
POST /api/assessments/:id/financials
  Input: { token, year, pAndL, balanceSheet, sourceFiles }
  Output: { financialId, message }

GET /api/assessments/:id/financials
  Input: Authorization: Bearer {token}
  Output: { financials: [...] }
```

---

## 🛠️ Step-by-Step Implementation

### STEP 1: Create Backend Project

```bash
# Create directory
mkdir finpro-backend
cd finpro-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express dotenv pg jsonwebtoken bcryptjs cors twilio axios
npm install --save-dev nodemon

# Create directory structure
mkdir api db middleware services utils
```

### STEP 2: Create package.json

```json
{
  "name": "finpro-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "pg": "^8.8.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "twilio": "^3.85.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

### STEP 3: Create .env File

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finpro_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_EMAIL_FROM=noreply@finpro.com

# Server
PORT=3001
NODE_ENV=development
```

### STEP 4: Create Express Server (index.js)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
});

// Routes
app.use('/api/auth', require('./api/auth')(pool));
app.use('/api/assessments', require('./api/assessments')(pool));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
```

### STEP 5: Create Authentication Module (api/auth.js)

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const crypto = require('crypto');

module.exports = (pool) => {
  const router = express.Router();
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Signup
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, fullName, customerType, phone } = req.body;

      // Validate input
      if (!email || !password || !fullName || !customerType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password, full_name, customer_type, phone_number, verified) VALUES ($1, $2, $3, $4, $5, false) RETURNING id',
        [email, hashedPassword, fullName, customerType, phone]
      );

      const userId = result.rows[0].id;

      // Send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await pool.query(
        'UPDATE users SET otp_secret = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpiry, userId]
      );

      // Send via Twilio
      await twilioClient.messages.create({
        body: `Your FinPro OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone || email
      });

      res.json({ userId, message: 'OTP sent. Please verify to complete signup.' });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send OTP
  router.post('/sendOtp', async (req, res) => {
    try {
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone required' });
      }

      // Find user
      const userQuery = await pool.query(
        'SELECT id, phone_number FROM users WHERE email = $1 OR phone_number = $2',
        [email, phone]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userQuery.rows[0].id;
      const userPhone = userQuery.rows[0].phone_number;

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // Store OTP
      await pool.query(
        'UPDATE users SET otp_secret = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpiry, userId]
      );

      // Send OTP via Twilio
      await twilioClient.messages.create({
        body: `Your FinPro OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: userPhone || phone
      });

      res.json({ userId, message: 'OTP sent to your phone' });
    } catch (error) {
      console.error('SendOTP error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify OTP
  router.post('/verifyOtp', async (req, res) => {
    try {
      const { userId, otp } = req.body;

      if (!userId || !otp) {
        return res.status(400).json({ error: 'userId and otp required' });
      }

      // Verify OTP
      const userQuery = await pool.query(
        'SELECT id, email, full_name, customer_type, otp_secret, otp_expires_at FROM users WHERE id = $1',
        [userId]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userQuery.rows[0];

      // Check OTP
      if (user.otp_secret !== otp) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }

      // Check expiry
      if (new Date() > user.otp_expires_at) {
        return res.status(401).json({ error: 'OTP expired' });
      }

      // Mark user as verified
      await pool.query(
        'UPDATE users SET verified = true, otp_secret = NULL WHERE id = $1',
        [userId]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Store session
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          customerType: user.customer_type
        }
      });
    } catch (error) {
      console.error('VerifyOTP error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get profile
  router.get('/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userQuery = await pool.query(
        'SELECT id, email, full_name, customer_type, created_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: userQuery.rows[0] });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  return router;
};
```

### STEP 6: Create Assessments API (api/assessments.js)

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware: Verify JWT
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Save assessment
  router.post('/', verifyToken, async (req, res) => {
    try {
      const { customerType, financialMetrics, loanRequirement, assessmentResults } = req.body;

      const result = await pool.query(
        `INSERT INTO assessments 
         (user_id, customer_type, financial_metrics, loan_requirement, assessment_results, status)
         VALUES ($1, $2, $3, $4, $5, 'complete')
         RETURNING id`,
        [req.userId, customerType, 
         JSON.stringify(financialMetrics),
         JSON.stringify(loanRequirement),
         JSON.stringify(assessmentResults)]
      );

      res.json({ assessmentId: result.rows[0].id, message: 'Assessment saved' });
    } catch (error) {
      console.error('Save assessment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all assessments
  router.get('/', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC',
        [req.userId]
      );

      res.json({ assessments: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single assessment
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM assessments WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      res.json({ assessment: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
```

---

## 📡 Frontend Changes Required

### Update Authentication (in cam-website.html)

```javascript
// OLD: localStorage-based login
// NEW: API-based login with OTP

// Create API client
const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

async function signup(email, password, fullName, customerType, phone) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, customerType, phone })
  });
  return response.json();
}

async function sendOtp(email) {
  const response = await fetch(`${API_BASE}/auth/sendOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}

async function verifyOtp(userId, otp) {
  const response = await fetch(`${API_BASE}/auth/verifyOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp })
  });
  return response.json();
}

async function saveAssessment(token, assessmentData) {
  const response = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(assessmentData)
  });
  return response.json();
}
```

---

## 🚀 Deployment to Vercel

### Create vercel.json

```json
{
  "version": 2,
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "buildCommand": "npm install"
}
```

### Deploy Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Set environment variables in Vercel dashboard
# Go to: vercel.com → Project Settings → Environment Variables
# Add:
#   - DB_HOST (your PostgreSQL host)
#   - DB_NAME
#   - DB_USER
#   - DB_PASSWORD
#   - JWT_SECRET
#   - TWILIO_ACCOUNT_SID
#   - TWILIO_AUTH_TOKEN
#   - TWILIO_PHONE_NUMBER

# 4. Deploy
vercel deploy

# 5. Set production environment variables
vercel env add DB_HOST
vercel env add TWILIO_ACCOUNT_SID
# ... etc

# 6. Deploy to production
vercel --prod
```

---

## 💾 Free PostgreSQL Database Options

### Option 1: Railway (Recommended)
```
1. Go to railway.app
2. Create account
3. Create new project
4. Add PostgreSQL plugin
5. Get connection string
6. Use in .env
```

### Option 2: Supabase
```
1. Go to supabase.com
2. Create account
3. Create new project
4. PostgreSQL included
5. Get connection string from Settings → Database
```

### Option 3: Render
```
1. Go to render.com
2. Create account
3. Create PostgreSQL database
4. Free tier: 256 MB
5. Get connection string
```

---

## 🔑 Get Twilio Credentials

```
1. Go to twilio.com
2. Create free account (free trial credits: $15)
3. Go to: console.twilio.com
4. Get:
   - ACCOUNT_SID
   - AUTH_TOKEN
   - PHONE_NUMBER (your Twilio number)
5. Add to .env
```

---

## 📋 Complete Checklist

### Setup
- [ ] Create Node.js project
- [ ] Install dependencies
- [ ] Create .env file
- [ ] Create database (PostgreSQL)
- [ ] Get Twilio credentials
- [ ] Create Express server

### Backend
- [ ] Implement authentication endpoints
- [ ] Implement OTP service
- [ ] Implement assessment endpoints
- [ ] Test all API endpoints
- [ ] Add error handling

### Frontend
- [ ] Update login UI (add signup, OTP)
- [ ] Replace localStorage with API calls
- [ ] Update assessment saving
- [ ] Add token management
- [ ] Test integration

### Deployment
- [ ] Create Vercel account
- [ ] Set up environment variables
- [ ] Deploy backend (serverless)
- [ ] Deploy frontend
- [ ] Test in production
- [ ] Set up custom domain

---

## 🎯 Timeline Estimate

- Backend setup: 30 min
- Database setup: 15 min
- Authentication: 45 min
- Assessment API: 30 min
- Frontend updates: 1 hour
- Testing: 30 min
- Deployment: 30 min

**Total: ~3.5-4 hours** (if no issues)

---

## ✅ After Completion

✅ Users can sign up with email
✅ OTP verification works
✅ Assessments saved to database
✅ Multi-user support
✅ Data persists
✅ Hosted on Vercel
✅ Free (with free-tier services)

---

**Ready to start? Let's begin with Step 1!**
