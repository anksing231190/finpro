# FinPro Full-Stack Deployment Guide

Complete step-by-step guide to deploy FinPro with database, authentication, and OTP.

---

## 🎯 Overview

You now have a complete full-stack application:

```
Frontend (cam-website.html)  ←→  Backend (Node.js/Express)  ←→  Database (PostgreSQL)
   (User Interface)            (API Server)                    (User Data & Assessments)
   
   + OTP Login (Twilio)
   + User Registration
   + Multi-user Support
```

---

## 📋 Prerequisites

Before you start, you need:

1. **Twilio Account** (for OTP)
2. **PostgreSQL Database** (for data storage)
3. **Node.js** (v16 or higher)
4. **Vercel Account** (for hosting)
5. **GitHub Account** (for code repository)

---

## ⚙️ Phase 1: Get Your Credentials

### Step 1A: Get Twilio Credentials

1. Go to **https://www.twilio.com/console**
2. Create free account (FREE TRIAL: $15 credits)
3. Click **Account** in left sidebar
4. Copy and save:
   - **Account SID** (looks like: ACxxxxxxxx...)
   - **Auth Token** (looks like: your token here)
5. Go to **Phone Numbers** → **Manage Numbers**
6. Create a Twilio phone number (free trial number)
7. Copy the **Phone Number** (e.g., +1234567890)

**Save these safely!**

### Step 1B: Set Up PostgreSQL Database

**Option 1: Railway (RECOMMENDED)**
1. Go to **https://railway.app**
2. Sign up with GitHub
3. Create new project
4. Add **PostgreSQL** database
5. Once created, click the PostgreSQL plugin
6. Go to **Variables** tab
7. Copy the connection string that looks like:
   ```
   postgresql://user:password@host:port/database
   ```
8. Save all individual components:
   - Host
   - Port (usually 5432)
   - Database name
   - Username
   - Password

**Option 2: Supabase**
1. Go to **https://supabase.com**
2. Sign up and create new project
3. Go to **Settings → Database** (left sidebar)
4. Copy connection string and parse it

**Option 3: AWS RDS Free Tier**
1. Go to **https://aws.amazon.com/rds**
2. Create PostgreSQL instance
3. Get connection details

### Step 1C: Create Database Schema

Once you have PostgreSQL credentials:

1. Install **pgAdmin** or **psql** (PostgreSQL CLI)
2. Connect to your database:
   ```bash
   psql postgresql://user:password@host:port/database
   ```
3. Run the schema:
   ```bash
   \i backend/db/schema.sql
   ```
   OR copy-paste the SQL from `backend/db/schema.sql` directly

4. Verify tables created:
   ```bash
   \dt
   ```
   You should see: `users, sessions, assessments, multi_year_financials`

---

## 🛠️ Phase 2: Set Up Backend Locally

### Step 2A: Install Node.js

1. Go to **https://nodejs.org**
2. Download **LTS version** (v18 or v20)
3. Install it
4. Verify:
   ```bash
   node --version
   npm --version
   ```

### Step 2B: Set Up Backend Project

```bash
# Navigate to the backend directory
cd FinPro/backend

# Install dependencies
npm install

# This installs: express, postgres, jwt, bcryptjs, twilio, etc.
```

### Step 2C: Create Environment File

1. In `FinPro/backend/` folder, create `.env` file:
   ```bash
   # Copy from .env.example
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   # Database
   DB_HOST=your-railway-host.railway.app
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=your-password

   # JWT Secret (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=abc123def456xyz789...

   # Twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxx...
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890

   # Server
   PORT=3001
   NODE_ENV=development
   ```

### Step 2D: Test Backend Locally

```bash
# Start the server
npm run dev

# You should see:
# ✅ Database connected at: 2024-01-15 10:30:00
# 🚀 FinPro Backend running on port 3001
```

Visit: **http://localhost:3001/api/health**

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "development"
}
```

---

## 🎨 Phase 3: Update Frontend

### Step 3A: Include API Client in HTML

In `cam-website.html`, add before closing `</head>` tag:

```html
<!-- Add this line in the <head> section -->
<script src="frontend/api-client.js"></script>
```

### Step 3B: Update Login Logic

Replace the current `doLogin()` function in `cam-website.html` with:

```javascript
// NEW LOGIN FLOW WITH OTP
let currentLoginMode = 'login'; // 'login', 'signup', 'otp'
let pendingUserId = null;

function showAuthScreen() {
  // Hide all screens
  document.querySelectorAll('[id^="screen"]').forEach(s => s.style.display = 'none');
  
  // Show login screen
  document.getElementById('authScreen').style.display = 'block';
  currentLoginMode = 'login';
  updateAuthUI();
}

function updateAuthUI() {
  const container = document.getElementById('authContent');
  
  if (currentLoginMode === 'login') {
    container.innerHTML = `
      <h2>Login to FinPro</h2>
      <input type="email" id="loginEmail" placeholder="Enter your email" />
      <button onclick="handleSendOTP()">Send OTP</button>
      <p>Don't have an account? <a href="#" onclick="switchToSignup()">Sign Up</a></p>
    `;
  } else if (currentLoginMode === 'signup') {
    container.innerHTML = `
      <h2>Sign Up for FinPro</h2>
      <input type="email" id="signupEmail" placeholder="Email" />
      <input type="password" id="signupPassword" placeholder="Password" />
      <input type="text" id="signupName" placeholder="Full Name" />
      <select id="signupType">
        <option value="">Select Type</option>
        <option value="Company">Company</option>
        <option value="Individual">Individual</option>
      </select>
      <input type="tel" id="signupPhone" placeholder="Phone (e.g., +91XXXXXXXXXX)" />
      <button onclick="handleSignup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="switchToLogin()">Login</a></p>
    `;
  } else if (currentLoginMode === 'otp') {
    container.innerHTML = `
      <h2>Verify OTP</h2>
      <p>Enter the 6-digit OTP sent to your phone</p>
      <input type="text" id="otpInput" placeholder="000000" maxlength="6" />
      <button onclick="handleVerifyOTP()">Verify OTP</button>
      <p><a href="#" onclick="switchToLogin()">Change email</a></p>
    `;
  }
}

async function handleSendOTP() {
  const email = document.getElementById('loginEmail').value.trim();
  
  if (!email) {
    alert('Please enter your email');
    return;
  }
  
  try {
    const response = await finproAPI.sendOtp(email);
    pendingUserId = response.userId;
    currentLoginMode = 'otp';
    updateAuthUI();
    alert('OTP sent to your phone!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleSignup() {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const fullName = document.getElementById('signupName').value.trim();
  const customerType = document.getElementById('signupType').value;
  const phone = document.getElementById('signupPhone').value.trim();
  
  if (!email || !password || !fullName || !customerType || !phone) {
    alert('Please fill all fields');
    return;
  }
  
  try {
    const response = await finproAPI.signup(
      email, password, fullName, customerType, phone
    );
    pendingUserId = response.userId;
    currentLoginMode = 'otp';
    updateAuthUI();
    alert('Account created! OTP sent to your phone.');
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
}

async function handleVerifyOTP() {
  const otp = document.getElementById('otpInput').value.trim();
  
  if (!otp || otp.length !== 6) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    await finproAPI.verifyOtp(pendingUserId, otp);
    
    // Login successful
    state.currentUser = finproAPI.user;
    goToScreen(1);
    
    alert('Welcome ' + state.currentUser.fullName + '!');
  } catch (error) {
    alert('OTP verification failed: ' + error.message);
  }
}

function switchToSignup() {
  currentLoginMode = 'signup';
  updateAuthUI();
}

function switchToLogin() {
  currentLoginMode = 'login';
  updateAuthUI();
}

function doLogout() {
  finproAPI.logout();
  state.currentUser = null;
  currentLoginMode = 'login';
  showAuthScreen();
}
```

### Step 3C: Update Assessment Saving

Replace assessment saving logic with:

```javascript
// Save assessment to database instead of localStorage
async function saveAssessmentToDatabase() {
  try {
    if (!finproAPI.isAuthenticated()) {
      alert('Please login first');
      return;
    }
    
    const assessmentData = {
      customerType: state.currentUser.type,
      financialMetrics: state.financialMetrics,
      loanRequirement: state.loanRequirement,
      assessmentResults: state.assessment,
      yearsData: state.yearsData
    };
    
    const response = await finproAPI.saveAssessment(assessmentData);
    alert('Assessment saved! ID: ' + response.assessmentId);
    
  } catch (error) {
    alert('Error saving assessment: ' + error.message);
  }
}

// Load previous assessments
async function loadPreviousAssessments() {
  try {
    if (!finproAPI.isAuthenticated()) {
      return;
    }
    
    const response = await finproAPI.getAssessments();
    console.log('Your assessments:', response.assessments);
    
    // Display in a list
    const assessmentList = response.assessments
      .map(a => `${a.customer_type} - ${a.created_at}`)
      .join('\n');
    
    console.log('Assessments:\n' + assessmentList);
  } catch (error) {
    console.error('Error loading assessments:', error);
  }
}
```

### Step 3D: Check Current State

Make sure the following is in your `cam-website.html`:

```javascript
// Global state (should already exist)
let state = {
  currentUser: {
    name: '',
    type: 'Company',
    loginTime: null
  },
  // ... rest of state
};

// On page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  if (finproAPI.isAuthenticated()) {
    state.currentUser = finproAPI.user;
    goToScreen(1); // Go to main app
  } else {
    showAuthScreen(); // Show login screen
  }
});
```

---

## 🚀 Phase 4: Test Everything Locally

### Step 4A: Start Backend

```bash
cd backend
npm run dev

# Terminal shows:
# ✅ Database connected
# 🚀 FinPro Backend running on port 3001
```

### Step 4B: Open Frontend

```bash
# Open the HTML file in browser
Open: file:///C:/Users/Welcome/Desktop/FinPro/cam-website.html
```

### Step 4C: Test Signup → OTP → Login

1. Click **"Sign Up"**
2. Enter:
   - Email: test@example.com
   - Password: test123
   - Name: Test User
   - Type: Company
   - Phone: +1234567890 (or your actual phone)
3. Click **"Sign Up"**
4. Check your phone/SMS for OTP (or check backend console)
5. Enter OTP (check backend logs if SMS fails)
6. Should login and go to main app

### Step 4D: Test Features

- Create assessment
- Change customer type
- Upload multi-year files
- Generate report

All data now saves to PostgreSQL database instead of localStorage!

---

## 🌐 Phase 5: Deploy to Vercel

### Step 5A: Create GitHub Repository

```bash
cd FinPro

# Initialize git
git init

# Create GitHub repo at github.com/your-username/finpro

# Add files
git add .
git commit -m "Initial commit: FinPro full-stack"

# Push to GitHub
git remote add origin https://github.com/your-username/finpro.git
git branch -M main
git push -u origin main
```

### Step 5B: Deploy Backend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel deploy

# You'll see:
# Vercel CLI
# ? Set up and deploy "/path/to/backend"? [Y/n] y
# ? Which scope? (your name/account)
# ? Link to existing project? [y/N] n
# ? Project name? finpro-backend
# ? Detected Node.js settings. Continue? [Y/n] y
# ? Want to modify these settings? [y/N] n
# 
# ✅ Production: https://finpro-backend.vercel.app
```

### Step 5C: Set Environment Variables on Vercel

1. Go to **vercel.com → Projects → finpro-backend**
2. Click **Settings**
3. Go to **Environment Variables**
4. Add variables:

```
DB_HOST = railway-host.railway.app
DB_PORT = 5432
DB_NAME = railway
DB_USER = postgres
DB_PASSWORD = your-password
JWT_SECRET = your-secret-key
TWILIO_ACCOUNT_SID = ACxxxxxxx
TWILIO_AUTH_TOKEN = your-token
TWILIO_PHONE_NUMBER = +1234567890
NODE_ENV = production
```

5. Deploy again:
   ```bash
   vercel deploy --prod
   ```

### Step 5D: Deploy Frontend to Vercel

1. Go to **vercel.com → Add New → Project**
2. Select your GitHub repository
3. Framework Preset: **Other**
4. Build Command: (leave empty)
5. Output Directory: (leave empty)
6. Click **Deploy**

7. Update `frontend/api-client.js` to use Vercel backend URL:
   ```javascript
   const API_BASE = 'https://finpro-backend.vercel.app/api';
   ```

8. Redeploy:
   ```bash
   vercel deploy --prod
   ```

---

## ✅ Verification Checklist

- [ ] Backend running locally and connected to database
- [ ] Signup works
- [ ] OTP verification works (check SMS or console)
- [ ] Login works
- [ ] Assessment saves to database
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] End-to-end testing complete
- [ ] Custom domain configured (optional)

---

## 📊 Free Services Used

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Twilio** | $15 credits (SMS/voice) | FREE for development |
| **Railway** | $5/month (generous) | $0-5 |
| **PostgreSQL** | Included with Railway | $0 |
| **Vercel** | Serverless functions | FREE |
| **GitHub** | Unlimited repos | FREE |
| **Total Monthly Cost** | | **$0-5** |

---

## 🔒 Production Checklist

Before going live:

- [ ] Change all credentials in environment variables
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up custom domain
- [ ] Configure CORS properly
- [ ] Rate limit API endpoints
- [ ] Add monitoring/logging
- [ ] Backup database regularly
- [ ] Update dependencies: `npm audit fix`
- [ ] Test email/SMS in production

---

## 🆘 Troubleshooting

### "Database connection failed"
```
→ Check DB credentials in .env
→ Verify PostgreSQL is running
→ Check firewall allows connections
→ Use pgAdmin to test connection separately
```

### "OTP not sending"
```
→ Check Twilio phone number is correct
→ Verify Twilio account has credits
→ Check phone number format (+country-code-number)
→ Review Twilio console logs
```

### "Token expired"
```
→ Increase JWT expiry in auth.js (expiresIn: '30d')
→ Clear localStorage and re-login
```

### "CORS error"
```
→ Backend: Check CORS configuration
→ Frontend: Verify API_BASE URL is correct
→ Check backend allows frontend origin
```

### "API 404 error"
```
→ Verify backend is running
→ Check endpoint URLs match
→ Verify vercel.json routing configuration
```

---

## 📞 Getting Help

Check these in order:
1. Console errors (F12 → Console)
2. Backend logs (terminal)
3. Vercel deployment logs
4. Database logs (Railway dashboard)
5. Twilio console logs

---

## 🎉 Success!

You now have:

✅ Full-stack credit assessment app
✅ User authentication with OTP
✅ PostgreSQL database
✅ Deployed on Vercel (free)
✅ Multi-user support
✅ Professional production setup

**Total cost: $0-5/month** (just Railway database)

---

**Next Steps:**
1. Follow Phase 1 to get credentials
2. Follow Phase 2 to set up backend locally
3. Follow Phase 3 to update frontend
4. Follow Phase 4 to test
5. Follow Phase 5 to deploy

Let me know if you get stuck on any phase! 🚀
