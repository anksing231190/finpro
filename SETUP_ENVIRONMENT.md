# FinPro - Environment Setup & Deployment Guide

Complete guide for running FinPro locally, testing, and deploying to production.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Browser Setup](#browser-setup)
3. [Data Storage (LocalStorage)](#data-storage-localstorage)
4. [Testing Locally](#testing-locally)
5. [Debugging](#debugging)
6. [Production Deployment](#production-deployment)
7. [Database Setup (Optional)](#database-setup-optional)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
✅ **No installation required!**

The app is a **single standalone HTML file** with:
- ✅ No build process needed
- ✅ No npm dependencies
- ✅ No configuration files
- ✅ No server setup required

Simply open `cam-website.html` in any modern browser.

### Option 1: Direct File Open
```bash
# Windows
Double-click: C:\Users\Welcome\Desktop\FinPro\cam-website.html

# Or from PowerShell
Start-Process "C:\Users\Welcome\Desktop\FinPro\cam-website.html"
```

### Option 2: Local Web Server (Recommended for Testing)

A local web server helps ensure compatibility with production deployment.

**Using Python 3:**
```bash
cd C:\Users\Welcome\Desktop\FinPro
python -m http.server 8000

# Then open: http://localhost:8000/cam-website.html
```

**Using Node.js / npx (if installed):**
```bash
cd C:\Users\Welcome\Desktop\FinPro
npx http-server -p 8000

# Then open: http://localhost:8000/cam-website.html
```

**Using Windows PowerShell:**
```powershell
cd C:\Users\Welcome\Desktop\FinPro
python -m http.server 8000

# Or use built-in IIS if available
cd C:\Users\Welcome\Desktop\FinPro
# Navigate to http://localhost/FinPro/cam-website.html
```

### Option 3: IDE Development Server

If using Visual Studio Code:
```bash
# Install Live Server extension
# Then right-click cam-website.html → Open with Live Server

# Server runs on http://localhost:5500
```

---

## Browser Setup

### Recommended Browsers
- ✅ **Chrome** (recommended) - best compatibility
- ✅ **Firefox** - full support
- ✅ **Safari** - full support (macOS/iOS)
- ✅ **Edge** - full support (Windows)
- ⚠️ **Internet Explorer** - NOT supported

### Browser Settings for Development

**Enable Developer Tools:**
- Chrome/Edge: Press `F12` or `Ctrl+Shift+I`
- Firefox: Press `F12` or `Ctrl+Shift+I`
- Safari: Enable in Preferences → Advanced

**LocalStorage Access:**
- DevTools → Application → LocalStorage
- See stored data, edit, delete as needed

**Console Access:**
- DevTools → Console tab
- View errors and warnings
- Run JavaScript commands

---

## Data Storage (LocalStorage)

### How Data is Stored

FinPro uses **browser localStorage** (no backend database required):

```javascript
// Examples of what gets stored:
localStorage['camData_ABC Manufacturing'] = { ... company details ... }
localStorage['yearsData_ABC Manufacturing'] = { FY2023: {...}, FY2024: {...} }
localStorage['assessmentData_ABC Manufacturing'] = { ... assessment results ... }
localStorage['currentSession'] = { user: 'John Doe', type: 'Company' }
```

### Accessing LocalStorage in Browser Console

```javascript
// View all stored data
console.log(localStorage)

// View specific customer data
console.log(localStorage.getItem('camData_ABC Manufacturing'))

// View years data
console.log(JSON.parse(localStorage.getItem('yearsData_ABC Manufacturing')))

// Clear specific customer
localStorage.removeItem('camData_ABC Manufacturing')

// Clear ALL data (careful!)
localStorage.clear()
```

### Storage Limits

| Browser | Limit | Notes |
|---------|-------|-------|
| Chrome | ~10 MB | Per domain |
| Firefox | ~10 MB | Per domain |
| Safari | ~5 MB | Per domain |
| Edge | ~10 MB | Per domain |

Typical FinPro usage: **2-5 MB per customer** (depending on multi-year data volume)

### Data Persistence

**Persists across:**
- ✅ Browser closing/reopening
- ✅ Website refreshes
- ✅ Different tabs (same browser)
- ✅ Multiple sessions (same customer)

**Clears when:**
- ❌ Browser private/incognito mode (data not persisted)
- ❌ User manually clears browser cache
- ❌ User clears application data
- ❌ Browser cookies/storage settings cleared

---

## Testing Locally

### Smoke Test Checklist

Use this checklist before considering the app ready:

```
Login & Navigation
[ ] Can enter login screen
[ ] Can select Company mode
[ ] Can select Individual mode
[ ] Can navigate between screens
[ ] Can go back from any screen

Company Mode
[ ] CAM details form visible
[ ] All company-specific fields shown
[ ] Banking tab shows account details
[ ] Financials tab visible
[ ] Can fill loan requirement
[ ] Can generate assessment
[ ] DSCR calculation correct

Individual Mode
[ ] Personal details form visible
[ ] All individual-specific fields shown
[ ] Banking tab shows salary account
[ ] Income tab visible (not Financials)
[ ] Can fill loan requirement
[ ] Can generate assessment
[ ] FOIR calculation correct

Multi-Year Upload
[ ] Can drag files to upload zone
[ ] Files process successfully
[ ] Year tabs generate dynamically
[ ] Extracted data displays correctly
[ ] Can switch between years
[ ] Can edit extracted values

Assessment
[ ] Loan structuring options appear
[ ] Scenarios display correctly
[ ] Trends show for multi-year
[ ] Report generates and downloads

Data Persistence
[ ] Data survives page refresh
[ ] Data survives browser close/open
[ ] Data persists between sessions
```

### Test Data

**Sample Company Data:**
```
Company: ABC Manufacturing
GST: 27AABCT1234A1Z0
Business Type: Manufacturing
Promoter: Rajesh Kumar
Vintage: 12 years
Constitution: Pvt Ltd

Financials (3-year):
FY2023: Sales ₹174.70 Cr, EBITDA ₹32.50 Cr, PAT ₹15.80 Cr
FY2024: Sales ₹196.20 Cr, EBITDA ₹36.80 Cr, PAT ₹18.20 Cr
FY2025: Sales ₹218.40 Cr, EBITDA ₹40.20 Cr, PAT ₹20.60 Cr
```

**Sample Individual Data:**
```
Name: Priya Singh
DOB: 15-Jan-1985
Employer: Tech Company Ltd
Employment Type: Permanent
Gross Salary: ₹1,85,000/month
Current EMI: ₹45,000/month
CIBIL Score: 750
```

### Automated Testing (Optional)

For automated browser testing, use Playwright or Selenium:

```javascript
// Example: Playwright test
const { test, expect } = require('@playwright/test');

test('Company mode assessment', async ({ page }) => {
  await page.goto('http://localhost:8000/cam-website.html');
  await page.selectOption('select[name="customerType"]', 'company');
  await page.fill('input[name="companyName"]', 'ABC Manufacturing');
  // ... continue testing
});
```

---

## Debugging

### Browser Console

**View all errors:**
```javascript
// Check console for JavaScript errors
// Errors appear in red, warnings in yellow
```

**Debug loan calculations:**
```javascript
// Open DevTools Console and type:
console.log(state.financialMetrics)  // See all extracted metrics
console.log(state.yearsData)          // See multi-year data
console.log(state.assessment)         // See calculated results
```

**Check localStorage:**
```javascript
// View all customer data stored
Object.keys(localStorage).forEach(key => {
  console.log(`${key}:`, localStorage.getItem(key));
});
```

### Common Issues & Fixes

#### Data not persisting
```javascript
// Check if localStorage is available
if (typeof(Storage) === "undefined") {
  console.error("localStorage not available - check browser settings");
} else {
  console.log("localStorage available, size:", Object.keys(localStorage).length);
}
```

#### File upload failing
```javascript
// Check file in DevTools → Network tab
// Look for failed requests or console errors
// Ensure file is PDF/Word (not corrupted)
```

#### DSCR/FOIR calculations wrong
```javascript
// Check extracted financial metrics
console.log('Financial Metrics:', state.financialMetrics);
console.log('Assessment Data:', state.assessment);

// Verify manually:
// DSCR = NCA / (EMI * 12)
// FOIR = Monthly EMI / Monthly Salary
```

### Enable Logging

Add this to your browser console to enable detailed logging:

```javascript
// Enable debug mode
window.DEBUG = true;

// Logging wrapper
function log(msg, data) {
  if (window.DEBUG) {
    console.log(`[FinPro] ${msg}`, data || '');
  }
}

// Now all functions can use: log('User logged in', userData)
```

---

## Production Deployment

### Option 1: Static Web Server (Recommended)

Deploy as a static file on any web server:

**Nginx:**
```nginx
server {
    listen 80;
    server_name finpro.yourdomain.com;
    
    location / {
        root /var/www/finpro;
        index cam-website.html;
        
        # Cache HTML (short TTL)
        add_header Cache-Control "public, max-age=3600";
    }
}
```

**Apache:**
```apache
<VirtualHost *:80>
    ServerName finpro.yourdomain.com
    DocumentRoot /var/www/finpro
    
    <Directory /var/www/finpro>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ cam-website.html [QSA,L]
    </Directory>
</VirtualHost>
```

**IIS (Windows):**
```powershell
# Copy cam-website.html to IIS web root
Copy-Item "cam-website.html" "C:\inetpub\wwwroot\finpro\"

# Access at: http://your-domain/finpro/cam-website.html
```

### Option 2: Cloud Deployment

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy directly:
vercel --prod
```

**AWS S3 + CloudFront:**
```bash
# Upload to S3
aws s3 cp cam-website.html s3://finpro-bucket/

# Create CloudFront distribution for caching
# Access via CloudFront URL
```

**Netlify:**
```bash
# Drop cam-website.html into Netlify UI
# Or use CLI:
npm i -g netlify-cli
netlify deploy

# Access at: https://finpro.netlify.app
```

### Option 3: Docker Container

**Dockerfile:**
```dockerfile
FROM nginx:alpine

COPY cam-website.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t finpro:latest .
docker run -p 8000:80 finpro:latest
```

### HTTPS/SSL Setup

**Required for production!**

**Using Let's Encrypt + Nginx:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d finpro.yourdomain.com

# Update Nginx config
# Add to server block:
ssl_certificate /etc/letsencrypt/live/finpro.yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/finpro.yourdomain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

### Security Headers (Production)

Add these HTTP headers for security:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' 'unsafe-inline'
```

---

## Database Setup (Optional)

### Current Setup (No Database)
✅ **All data stored in browser localStorage**
- No server required
- No database setup needed
- Data is local to each browser

### For Production with Database

If you need persistent, server-backed storage:

#### Option A: PostgreSQL (Recommended)

**Schema for FinPro:**
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_type VARCHAR(20) CHECK (customer_type IN ('company', 'individual')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP DEFAULT NOW(),
  financial_metrics JSONB,
  loan_requirement JSONB,
  assessment_results JSONB,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE multi_year_financials (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  year VARCHAR(20),
  financial_year VARCHAR(10),
  p_and_l JSONB,
  balance_sheet JSONB,
  source_files TEXT[],
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_id ON assessments(customer_id);
CREATE INDEX idx_financial_year ON multi_year_financials(year);
```

**Setup:**
```bash
# Install PostgreSQL
apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb finpro_db

# Load schema
psql -U postgres -d finpro_db -f schema.sql
```

#### Option B: MongoDB

```javascript
// Collection structure
db.customers.insertOne({
  _id: ObjectId(),
  customerType: "company",
  name: "ABC Manufacturing",
  email: "contact@abc.com",
  createdAt: new Date()
});

db.assessments.insertOne({
  _id: ObjectId(),
  customerId: ObjectId("..."),
  financialMetrics: {...},
  assessmentResults: {...},
  createdAt: new Date()
});
```

#### Option C: Google Sheets API

Store data in Google Sheets (simple, no server):

```javascript
// Using Google Sheets API
const sheetId = 'YOUR_SHEET_ID';
const range = 'Assessments!A:Z';

// Append assessment data
sheets.spreadsheets.values.append({
  spreadsheetId: sheetId,
  range: range,
  valueInputOption: 'USER_ENTERED',
  resource: {
    values: [[customer, metrics, results, date]]
  }
});
```

---

## Performance Optimization

### Frontend Optimization

**Minify HTML/CSS/JS (Optional):**
```bash
# Using online tools or build tools:
npx terser cam-website.html -o cam-website.min.html
```

**Caching Strategy:**
```
Cache HTML: 1 hour (max-age=3600)
Cache static assets: 1 month (if served separately)
No cache for active development
```

### Browser Performance

**Check performance in DevTools:**
```javascript
// DevTools → Performance tab → Record
// Identify slow operations

// Check load time
console.log(performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms')
```

**Optimize large operations:**
```javascript
// Use requestIdleCallback for background tasks
requestIdleCallback(() => {
  calculateTrends();  // Run when browser is idle
});

// Or use setTimeout for UI responsiveness
setTimeout(() => {
  heavyCalculation();
}, 100);
```

---

## Troubleshooting

### Issue: "localStorage is not available"

**Cause:** Browser has localStorage disabled or is in private mode

**Solution:**
```javascript
// Use in-memory storage instead
let appData = {};

// Or enable localStorage in browser settings
// Chrome: Settings → Privacy → Cookies and other site data
```

### Issue: "File upload not working"

**Causes & Solutions:**
```
1. File is too large (>10 MB)
   → Split file or compress
   
2. File is corrupted
   → Try different file format (Word instead of PDF)
   
3. Browser security restrictions
   → Use full web server (not file://)
   → Check CORS headers if separate backend
   
4. File type not supported
   → Ensure PDF is searchable (not scanned image)
   → Try converting to Word format
```

### Issue: "Assessment calculations are wrong"

**Debug:**
```javascript
// Step 1: Check extracted data
console.log(state.financialMetrics);

// Step 2: Verify calculation
// DSCR = NCA / (EMI * 12)
let expectedDSCR = state.financialMetrics.nca / (state.loanRequirement.emi * 12);
console.log('Expected DSCR:', expectedDSCR, 'Actual:', state.assessment.dscr);

// Step 3: Check for data type issues
console.log(typeof state.financialMetrics.nca);  // Should be number

// Step 4: Manually verify in calculator
// Open browser console → test calculation
```

### Issue: "App is very slow"

**Optimize:**
```javascript
// 1. Clear old data from localStorage
localStorage.clear();  // Warning: clears all data!

// 2. Profile with DevTools Performance
// 3. Look for slow calculations
// 4. Check network tab for large files

// 5. Reduce data complexity
// Don't store all years if not needed
```

### Issue: "Report PDF not downloading"

**Check:**
```javascript
// 1. Browser allows downloads
// 2. Pop-ups not blocked
// 3. No JavaScript errors in console
// 4. Try different browser
// 5. Check file size (< 10 MB usually ok)
```

---

## Monitoring & Maintenance

### Monitor User Activity (Optional)

```javascript
// Simple logging to localStorage
function logActivity(action, data) {
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    action: action,
    data: data
  });
  localStorage.setItem('activityLogs', JSON.stringify(logs));
}

// Usage
logActivity('assessment_generated', { customer: 'ABC Inc', dscr: 2.1 });
```

### Regular Maintenance

```bash
# Weekly: Clear old localStorage data
# Monthly: Backup stored assessments
# Quarterly: Review security settings
# Yearly: Update SSL certificates

# Backup command (if using server):
tar -czf finpro_backup_$(date +%Y%m%d).tar.gz /var/www/finpro/
```

---

## Support

For deployment issues:
1. Check console errors (F12 → Console)
2. Verify browser is supported (Chrome/Firefox/Safari/Edge)
3. Clear browser cache and localStorage
4. Try different browser or incognito mode
5. Review SETUP_ENVIRONMENT.md again
6. Check TEST_RESULTS.md for known issues

---

**Status**: ✅ **Ready for Deployment**

FinPro can be deployed as a static file to any web server with HTTPS/SSL support.
