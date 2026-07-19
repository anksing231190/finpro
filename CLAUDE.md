# FinPro Development Guidelines

Standards and guidelines for developing and maintaining FinPro.

---

## Project Summary

**FinPro** is a standalone web-based credit assessment module supporting:
- Company borrower assessment (DSCR-based loan sizing)
- Individual borrower assessment (FOIR-based loan sizing)
- Multi-year financial statement batch upload
- Dynamic loan structuring and scenario analysis
- Trend analysis and assessment reports

**Tech Stack:**
- Pure HTML/CSS/JavaScript (no frameworks)
- Browser localStorage for data persistence
- Single HTML file (cam-website.html)
- No database, no backend server, no npm dependencies

---

## File Structure

```
FinPro/
├── cam-website.html              # Main app (5000+ lines)
├── README.md                     # Project overview
├── SETUP_ENVIRONMENT.md          # Deployment and setup guide
├── IMPLEMENTATION_SUMMARY.md     # Technical implementation details
├── INDIVIDUAL_MODE_IMPLEMENTATION.md # Individual mode specs
├── MULTI_YEAR_UPLOAD_GUIDE.md    # User guide
├── TEST_RESULTS.md              # Test coverage
├── MULTI_YEAR_ENHANCEMENT_PLAN.md # Design documentation
└── CLAUDE.md                    # This file
```

---

## Code Organization (cam-website.html)

### Structure
```javascript
// 1. HTML (lines 1-1500)
// 2. CSS (lines 1500-2500)
// 3. JavaScript (lines 2500-5000+)
//    - Global state object
//    - Core functions (navigation, login)
//    - Financial extraction & calculations
//    - UI rendering & interaction
//    - Assessment & reporting
```

### Global State Object

```javascript
let state = {
  currentUser: {
    name: string,
    type: 'Company' | 'Individual',
    loginTime: timestamp
  },
  
  camDetails: {
    // Company-specific
    companyName: string,
    gst: string,
    constitution: string,
    businessVintage: number,
    // Individual-specific
    fullName: string,
    dob: date,
    employer: string,
    jobTenure: number,
    grossSalary: number,
    // ... more fields
  },
  
  bankingDetails: {
    // Company or Individual details
    accountNumber: string,
    bankName: string,
    balance: number,
    // ... more fields
  },
  
  yearsData: {
    'FY2023': {
      pnl: { netSales, ebitda, pat, ... },
      bs: { totalAssets, totalLiab, ... },
      files: [...],
      docType: string
    },
    'FY2024': { ... },
    'FY2025': { ... }
  },
  
  financialMetrics: {
    netSales: number,
    ebitda: number,
    pat: number,
    // ... all extracted metrics
  },
  
  loanRequirement: {
    amount: number,
    purpose: string,
    tenure: number,
    rate: number
  },
  
  assessment: {
    loanOptions: [...],
    scenarios: {...},
    trends: {...},
    finalRating: string
  }
};
```

---

## Key Functions

### User & Navigation
- `doLogin()` - Authenticate user and select mode
- `goToScreen(n)` - Navigate between screens
- `switchFieldsForMode(mode)` - Show/hide mode-specific UI
- `doLogout()` - Clear session and return to login

### Financial Data
- `handleMultiYearUpload(event)` - Process batch file upload
- `detectYearFromFilename(fname)` - Extract year from filename
- `detectDocType(fname)` - Identify document type
- `storeYearData(year, docType, data)` - Organize by year
- `generateYearTabs()` - Create dynamic year tabs
- `extractFinancialsFromForm()` - Parse extracted metrics
- `calculateTrends()` - Compute YoY growth and CAGR

### Assessment & Calculations
- `calcDSCR()` - Company DSCR calculation
- `calcFOIR()` - Individual FOIR calculation
- `calcLoanCapacity()` - Route to correct calculator
- `goToReview()` - Trigger assessment generation
- `renderAssessment()` - Display results and options
- `runScenario()` - Stress test calculations
- `generateReport()` - Create PDF export

### UI Rendering
- `buildBankTable()` - Create account activity table
- `switchYearTab(year, btn)` - Activate year tab
- `populateYearTabData(year, data)` - Fill year fields
- `showModal(title, content)` - Display dialog
- `updateUI()` - Refresh display after changes

---

## Coding Standards

### Naming Conventions

**Variables:**
```javascript
✅ Good:
let customerName = "ABC Manufacturing";
let yearsData = { FY2023: {...}, FY2024: {...} };
let grossSalary = 185000;
let isValidated = true;

❌ Bad:
let cn = "ABC Manufacturing";
let yd = {};
let gs = 185000;
let valid = true;  // ambiguous what "valid" means
```

**Functions:**
```javascript
✅ Good:
function handleMultiYearUpload(event) { ... }
function detectYearFromFilename(fname) { ... }
function calculateDSCR(nca, emi) { ... }
function switchFieldsForMode(mode) { ... }

❌ Bad:
function handle(e) { ... }
function detect(f) { ... }
function calc(n, e) { ... }
function switchFields(m) { ... }
```

**CSS Classes:**
```css
✅ Good:
.company-only { /* shown only in company mode */ }
.individual-only { /* shown only in individual mode */ }
.year-tab-active { /* active year tab */ }
.loan-option-card { /* single loan option */ }

❌ Bad:
.c { /* company */ }
.h { /* hidden */ }
.tab { /* ambiguous */ }
.card { /* too generic */ }
```

### Code Comments

**Only add comments when WHY is non-obvious:**

```javascript
✅ Good:
// DSCR must be > 1.0 for bank compliance; rounded to 2 decimals for display
let displayDSCR = Math.round(dscr * 100) / 100;

// Store by year since same company may provide multiple FY statements
let yearsData = {
  'FY2023': { pnl: {...}, bs: {...} },
  'FY2024': { pnl: {...}, bs: {...} }
};

❌ Bad:
// Calculate DSCR  (what does the code already say?)
let dscr = nca / (emi * 12);

// Extract metrics  (obvious from function name)
let metrics = extractFinancials();
```

**No code-generation comments:**
```javascript
❌ Bad:
// Parse P&L for net sales  (what? obvious)
// Handle the upload event  (for what? unclear)
// Render the assessment  (which assessment? unclear)

✅ Good:
// P&L may have line items labeled differently per industry;
// search for common variants and take the largest revenue number
let netSales = findLargestRevenueItem(pnlData);
```

---

## Development Workflow

### Adding a New Feature

**Example: Add "Debt Service" field to Company financials**

1. **Edit HTML** - Add input field in appropriate section
   ```html
   <input type="number" id="debtService" placeholder="Annual debt service">
   ```

2. **Add CSS** - Style the field if needed
   ```css
   #debtService { width: 200px; }
   ```

3. **Update extraction** - Parse from form
   ```javascript
   function extractFinancialsFromForm() {
     let metrics = {
       // ... existing fields ...
       debtService: parseFloat(document.getElementById('debtService').value) || 0
     };
   }
   ```

4. **Use in calculations** - Update dependent functions
   ```javascript
   function calcDSCR() {
     let dscr = state.financialMetrics.nca / state.financialMetrics.debtService;
     // ... rest of function
   }
   ```

5. **Test thoroughly** - Verify with different inputs
   ```
   - Test with empty field (should be 0)
   - Test with very large number (no overflow)
   - Test calculation impact (DSCR should change)
   - Test persistence (data should persist across refresh)
   ```

6. **Document** - Add to TEST_RESULTS.md if significant

### Modifying Calculation Logic

**Steps:**
1. Understand current formula (read TEST_RESULTS.md)
2. Update the function with new logic
3. Add inline comment if formula changes
4. Test with known test data
5. Update TEST_RESULTS.md with new expected output

Example:
```javascript
// BEFORE:
function calcLoanCapacity() {
  return state.financialMetrics.nca / 1.25;
}

// AFTER (with comment):
function calcLoanCapacity() {
  // Using both DSCR and leverage constraints per RBI guidelines
  let doscrConstraint = state.financialMetrics.nca / 1.25;
  let leverageConstraint = state.financialMetrics.atnw * 3.5 - state.financialMetrics.totalDebt;
  return Math.min(doscrConstraint, leverageConstraint);
}
```

### Handling Mode-Specific Logic

**Company vs Individual patterns:**

```javascript
✅ Good:
function switchFieldsForMode(mode) {
  document.querySelectorAll('.company-only').forEach(el => {
    el.style.display = mode === 'Company' ? 'block' : 'none';
  });
  document.querySelectorAll('.individual-only').forEach(el => {
    el.style.display = mode === 'Individual' ? 'block' : 'none';
  });
}

function renderAssessment() {
  if (state.currentUser.type === 'Company') {
    renderCompanyAssessment();
  } else {
    renderIndividualAssessment();
  }
}

❌ Bad:
// Trying to shoe-horn logic when should be separated
if (mode === 'Company') {
  // show these fields
  // calculate DSCR
  // show loan options
} else {
  // show different fields
  // calculate FOIR
  // show different options
}
```

---

## Testing & Verification

### Test Before Committing

**Run through this checklist:**

```
UI/Navigation
[ ] Login works with both modes
[ ] Field visibility correct for mode
[ ] All screens accessible
[ ] Back/next buttons work

Company Mode
[ ] Can fill CAM details
[ ] Can upload and process files
[ ] Year tabs generate correctly
[ ] Data persists after refresh
[ ] Assessment generates with correct DSCR
[ ] Scenarios show correct stress impact

Individual Mode
[ ] Can fill employment details
[ ] Income summary tab visible
[ ] FOIR calculates correctly
[ ] Assessment generates with correct options
[ ] Scenarios show salary/rate impact

Multi-Year Features
[ ] Drag-drop upload works
[ ] File types detected correctly
[ ] Year detection accurate
[ ] Trend calculations correct
[ ] Year-over-year growth shows

Edge Cases
[ ] Empty fields handled gracefully
[ ] Very large numbers don't overflow
[ ] Negative numbers handled appropriately
[ ] Zero values don't break calculations
[ ] Missing data points don't crash
```

### Test Data

Use standard test data in TEST_RESULTS.md:

```javascript
// Company test data
let testCompany = {
  name: 'ABC Manufacturing',
  gst: '27AABCT1234A1Z0',
  years: {
    FY2023: { netSales: 174.70, ebitda: 32.50, ... },
    FY2024: { netSales: 196.20, ebitda: 36.80, ... },
    FY2025: { netSales: 218.40, ebitda: 40.20, ... }
  }
};

// Individual test data
let testIndividual = {
  name: 'Priya Singh',
  salary: 185000,
  currentEMI: 45000,
  expectedFOIR: 0.243
};
```

---

## Performance Guidelines

### Acceptable Ranges

```
Action                    Target Time    Max Time
────────────────────────────────────────────────
Page load                 < 1s           < 3s
File upload (5 files)     1-3s           < 5s
Assessment generation     < 2s           < 5s
Report download           < 5s           < 10s
UI responsiveness         < 100ms        < 300ms
```

### Optimization Tips

**Avoid:**
```javascript
❌ O(n²) loops
❌ Deep nesting (3+ levels)
❌ Unnecessary DOM queries
❌ Large in-memory arrays
❌ Synchronous file processing
```

**Prefer:**
```javascript
✅ O(n) or O(n log n) algorithms
✅ Flat code structure
✅ Cache DOM queries
✅ Stream processing if possible
✅ Batch operations
```

---

## Browser Compatibility

### Required Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Avoid
- ❌ IE 11 (not supported)
- ❌ Older mobile browsers

### Test Methods

```javascript
// Feature detection
if (typeof localStorage !== 'undefined') {
  // localStorage available
}

if (typeof fetch !== 'undefined') {
  // fetch API available
}

// Polyfills if needed
if (!Array.from) {
  Array.from = function(obj) {
    return Array.prototype.slice.call(obj);
  };
}
```

---

## Security Considerations

### Current Security Model

**Browser-based, client-side only:**
- ✅ Data stays on user's browser (localStorage)
- ✅ No transmission of sensitive data
- ✅ No authentication required
- ✅ Safe for confidential testing

### For Production Deployment

**Implement:**
- [ ] HTTPS/SSL encryption
- [ ] User authentication & authorization
- [ ] Data validation on both client & server
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Encryption at rest

**Do NOT:**
- ❌ Store PII (passwords, SSN) in localStorage
- ❌ Transmit unencrypted data
- ❌ Trust client-side validation alone
- ❌ Expose API keys in code

---

## Debugging Tips

### Common Issues & Solutions

**Problem: Data not saving**
```javascript
// Check localStorage availability
console.log(Object.keys(localStorage));

// Check state object
console.log(state);

// Verify JSON serialization
console.log(JSON.stringify(state));
```

**Problem: Calculation wrong**
```javascript
// Break down the calculation
console.log('NCA:', state.financialMetrics.nca);
console.log('EMI:', state.loanRequirement.emi);
console.log('DSCR calculation:', state.financialMetrics.nca / (state.loanRequirement.emi * 12));
console.log('Expected:', 2.0);
```

**Problem: UI not updating**
```javascript
// Ensure state is modified BEFORE rendering
state.assessment.dscr = newValue;  // Modify state
renderAssessment();                 // Then render

// Don't do this:
renderAssessment();
state.assessment.dscr = newValue;  // Too late!
```

---

## Version Control Guidelines

### Commit Messages

```
✅ Good:
git commit -m "Add FOIR calculation for individual mode"
git commit -m "Fix year detection for FY2024 format"
git commit -m "Implement multi-year trend visualization"

❌ Bad:
git commit -m "Fix bug"
git commit -m "Update code"
git commit -m "Changes"
```

### Branch Names

```
✅ Good:
feature/individual-mode
feature/multi-year-upload
bugfix/dscr-calculation
docs/update-readme

❌ Bad:
feature1
test
temp
fix-issue
```

---

## Documentation Standards

### For Code Changes

Update relevant documentation:

1. **Add new feature** → Update README.md Features section
2. **Change calculation** → Update IMPLEMENTATION_SUMMARY.md
3. **Add test data** → Update TEST_RESULTS.md
4. **Change user flow** → Update MULTI_YEAR_UPLOAD_GUIDE.md
5. **Major refactor** → Update this CLAUDE.md

### Documentation Files

| File | Update When |
|------|------------|
| README.md | Feature added/removed |
| SETUP_ENVIRONMENT.md | Setup steps change |
| IMPLEMENTATION_SUMMARY.md | Core logic changes |
| TEST_RESULTS.md | Tests added/modified |
| MULTI_YEAR_UPLOAD_GUIDE.md | User flow changes |
| CLAUDE.md | Development standards change |

---

## Future Enhancements

### Planned Features
- [ ] Multi-user support with authentication
- [ ] Database backend (PostgreSQL)
- [ ] Advanced analytics dashboard
- [ ] Email report delivery
- [ ] Mobile app version
- [ ] API integration with banks
- [ ] Automated document OCR
- [ ] ML-based risk scoring

### Nice-to-Have
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Custom report templates
- [ ] Batch assessment processing
- [ ] API for third-party integration
- [ ] Automated compliance checks

---

## Getting Help

**Questions about code:**
1. Check IMPLEMENTATION_SUMMARY.md
2. Look at TEST_RESULTS.md for examples
3. Review existing similar functions
4. Check browser console for errors

**Questions about features:**
1. Check README.md overview
2. Check MULTI_YEAR_UPLOAD_GUIDE.md for user flows
3. Check INDIVIDUAL_MODE_IMPLEMENTATION.md for mode details

**Questions about deployment:**
1. Check SETUP_ENVIRONMENT.md
2. Check browser console (F12) for errors
3. Check localStorage (DevTools → Application)

---

## Standards Summary

**DO:**
- ✅ Use descriptive variable/function names
- ✅ Keep functions focused and small
- ✅ Add comments for non-obvious WHY
- ✅ Test thoroughly before committing
- ✅ Document changes in appropriate file
- ✅ Follow existing code patterns
- ✅ Validate inputs at system boundaries

**DON'T:**
- ❌ Use single-letter variable names
- ❌ Mix concerns in one function
- ❌ Add comments for obvious code
- ❌ Commit untested changes
- ❌ Leave TODO comments unresolved
- ❌ Reinvent the wheel (copy working code)
- ❌ Trust client-side data alone in production

---

**Last Updated:** 2026-07-19  
**Current Version:** 2.0.0  
**Status:** ✅ Active Development
