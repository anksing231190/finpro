# FinPro Backend - Quick Start (5 minutes)

Fast-track setup guide.

---

## 🎯 TL;DR Setup

### Prerequisites (Get These First)
```
1. Twilio Account (free, get SID/token/phone)
2. PostgreSQL Database (Railway recommended)
3. Node.js (v16+)
4. GitHub Account
5. Vercel Account
```

### 1. Get Twilio Credentials (5 min)
```
→ Go to twilio.com
→ Sign up (free $15 credits)
→ Get: Account SID, Auth Token, Phone Number
```

### 2. Set Up PostgreSQL (5 min)
```
→ Go to railway.app
→ Create project
→ Add PostgreSQL plugin
→ Copy connection string
→ Parse: host, port, database, user, password
```

### 3. Create Database Tables (2 min)
```bash
# Using psql or pgAdmin, run:
→ Copy-paste from: backend/db/schema.sql
→ Or use: psql postgresql://user:pass@host/db < schema.sql
```

### 4. Set Up Backend (3 min)
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your credentials:
# DB_HOST=...
# DB_PASSWORD=...
# TWILIO_*=...
# JWT_SECRET=(generate one)
```

### 5. Test Backend (2 min)
```bash
npm run dev

# Should see:
# ✅ Database connected
# 🚀 Server running on port 3001

# Visit: http://localhost:3001/api/health
# Should return JSON with "healthy" status
```

### 6. Update Frontend (5 min)
```html
<!-- Add to cam-website.html <head> -->
<script src="frontend/api-client.js"></script>
```

### 7. Deploy (5 min)
```bash
# Backend
cd backend
npm install -g vercel
vercel deploy --prod
# Copy the URL

# Update frontend/api-client.js with your Vercel URL
# Then deploy frontend to Vercel too
```

---

## 📁 File Structure

```
FinPro/
├── backend/
│   ├── index.js              # Main server
│   ├── package.json          # Dependencies
│   ├── .env.example          # Copy to .env
│   ├── .env                  # ← CREATE THIS (don't commit)
│   ├── vercel.json           # Deployment config
│   ├── api/
│   │   ├── auth.js           # Signup/Login/OTP
│   │   └── assessments.js    # Save/Load assessments
│   └── db/
│       └── schema.sql        # Database tables
├── frontend/
│   └── api-client.js         # API client for HTML
├── cam-website.html          # Main app (updated)
└── FULL_STACK_DEPLOYMENT_GUIDE.md  # Full guide
```

---

## 🔑 Environment Variables

```env
# .env file in backend/

# Database (from Railway/Supabase)
DB_HOST=your-host
DB_PORT=5432
DB_NAME=database_name
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=abc123def456...

# Twilio (from console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxx...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Server
PORT=3001
NODE_ENV=development
```

---

## 🧪 Quick Test

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123",
    "fullName":"Test User",
    "customerType":"Company",
    "phone":"+1234567890"
  }'

# Should return:
# { "userId": 1, "message": "Signup successful..." }
```

---

## 💡 Common Issues

| Issue | Fix |
|-------|-----|
| "Database connection error" | Check DB credentials in .env |
| "Cannot find module 'express'" | Run `npm install` |
| "Port 3001 already in use" | Kill process: `lsof -i :3001` or change PORT in .env |
| "OTP not sending" | Check Twilio account has credits |
| "ModuleNotFoundError: No module named 'pg'" | Run `npm install pg` |

---

## ✅ Success Indicators

- Backend starts without errors
- Database connection says "✅ Database connected"
- http://localhost:3001/api/health returns JSON
- Signup/Login/OTP flow works
- Data saves to database (check with pgAdmin)
- Frontend shows API responses in console

---

## 📊 Architecture

```
User (Browser)
    ↓
cam-website.html + api-client.js
    ↓
POST /api/auth/signup (Node.js/Express)
    ↓
PostgreSQL (stores user data)
    ↓
Returns: { token, user: {...} }
    ↓
Browser saves token in localStorage
    ↓
All future requests use token for authentication
```

---

## 🚀 Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] All env vars set in Vercel dashboard
- [ ] Frontend updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] Test signup on deployed version
- [ ] Test login on deployed version
- [ ] Test assessment save on deployed version

---

## 📞 Useful Commands

```bash
# Backend operations
npm install                    # Install dependencies
npm run dev                    # Start server (with auto-reload)
npm start                      # Start production server

# Deployment
vercel deploy                  # Deploy to staging
vercel deploy --prod          # Deploy to production
vercel env add VAR_NAME       # Add environment variable

# Database (psql)
psql postgresql://user:pass@host/db   # Connect
\dt                                    # List tables
\d users                              # Show users table
SELECT COUNT(*) FROM users;           # Count users
\q                                    # Quit
```

---

## 🎓 Learning Path

1. **Get Credentials** (20 min)
   - Twilio
   - PostgreSQL
   - Node.js installed

2. **Set Up Locally** (15 min)
   - Backend running
   - Database connected
   - API responding

3. **Test Locally** (10 min)
   - Signup
   - OTP verification
   - Login

4. **Deploy** (15 min)
   - Backend to Vercel
   - Frontend to Vercel
   - Test on live site

**Total: ~1 hour**

---

## 🔒 Security Reminders

- ✅ Never commit `.env` file (it's in `.gitignore`)
- ✅ Use strong JWT_SECRET (generated randomly)
- ✅ Keep Twilio credentials safe
- ✅ Use environment variables, not hardcoded values
- ✅ Enable HTTPS (automatic on Vercel)
- ✅ Change passwords before going live

---

## 💰 Free Services

| Service | Cost |
|---------|------|
| Twilio | FREE ($15 credits) |
| Railway DB | $0-5/month |
| Vercel Backend | FREE |
| Vercel Frontend | FREE |
| GitHub | FREE |
| **TOTAL** | **$0-5/month** |

---

## 📖 Full Documentation

For complete details, read: **FULL_STACK_DEPLOYMENT_GUIDE.md**

---

**Ready to start? Follow the TL;DR Setup above! 🚀**

Questions? Check error message in terminal/console.
