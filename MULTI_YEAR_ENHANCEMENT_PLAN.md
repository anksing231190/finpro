# Multi-Year Financial Statement Upload - Enhancement Plan

## Current Gap ❌

```
User uploads 3 files:
├── FY2023_P&L.pdf
├── FY2024_P&L.pdf
└── FY2025_Balance_Sheet.pdf

Result:
- Only last file's data stored
- Other years lost
- Year tabs remain unpopulated
- No trend analysis possible
```

## Required Implementation ✅

### 1. **Data Structure for Multi-Year Storage**

```javascript
// Current (single year)
let financialMetrics = {
  netSales: 0,
  ebitda: 0,
  // ... only current year
}

// Needed (multiple years)
let yearsData = {
  'FY2023': {
    netSales: 174.70,
    ebitda: 32.50,
    pat: 15.80,
    // ... complete P&L & BS
  },
  'FY2024': {
    netSales: 196.20,
    ebitda: 36.80,
    pat: 18.20,
    // ... complete P&L & BS
  },
  'FY2025': {
    netSales: 218.40,
    ebitda: 40.20,
    pat: 20.60,
    // ... complete P&L & BS
  }
}
```

### 2. **Enhanced Upload UI**

```
┌─────────────────────────────────────────────┐
│ Multi-Year Financial Statement Upload       │
├─────────────────────────────────────────────┤
│                                             │
│ Drag & drop or click to upload              │
│ (Supports multiple files at once)           │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 📄 FY2023_P&L.pdf      ✓ Done       │   │
│ │   Type: P&L            Year: 2023    │   │
│ │   Status: 15 fields extracted        │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 📄 FY2024_P&L.pdf      ✓ Done       │   │
│ │   Type: Balance Sheet  Year: 2024    │   │
│ │   Status: 20 fields extracted        │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 📄 FY2025_BS.pdf       ✓ Done       │   │
│ │   Type: Balance Sheet  Year: 2025    │   │
│ │   Status: 18 fields extracted        │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ [+ Add More] [Clear All] [Continue]        │
└─────────────────────────────────────────────┘
```

### 3. **Year Detection from Filename**

```javascript
// Auto-detect year from filename patterns:
detectYearFromFilename("FY2023_P&L.pdf")        → "FY2023" ✓
detectYearFromFilename("2024_Balance_Sheet.pdf") → "FY2024" ✓
detectYearFromFilename("31Mar25_PL.pdf")         → "FY2025" ✓
detectYearFromFilename("financial_statement.pdf") → "Unknown" ⚠️
                                                   (Manual selection)
```

### 4. **Document Type Detection**

```javascript
// Auto-detect document type from content:
detectDocType(extractedText)
  → "P&L" if contains: "Revenue", "EBITDA", "PAT", "Profit"
  → "Balance Sheet" if contains: "Assets", "Liabilities", "Equity"
  → "Unknown" if no clear match
```

### 5. **Multi-File Upload Handler**

```javascript
// New structure
state.uploadedYears = {
  'FY2023': {
    files: ['FY2023_P&L.pdf', 'FY2023_BS.pdf'],
    pnl: { netSales: 174.70, ebitda: 32.50, ... },
    bs: { totalAssets: 500, totalLiab: 300, ... }
  },
  'FY2024': {
    files: ['FY2024_Combined.pdf'],
    pnl: { netSales: 196.20, ebitda: 36.80, ... },
    bs: { totalAssets: 550, totalLiab: 310, ... }
  },
  'FY2025': {
    files: ['FY2025_P&L.pdf', 'FY2025_BS.pdf'],
    pnl: { netSales: 218.40, ebitda: 40.20, ... },
    bs: { totalAssets: 600, totalLiab: 320, ... }
  }
}
```

### 6. **Year Tab Population**

Before (hardcoded, empty):
```html
<button class="yr-tab active">FY 31-Mar-23 · Aud</button>
<button class="yr-tab">FY 31-Mar-24 · Aud</button>
<button class="yr-tab">FY 31-Mar-25 · Aud</button>
<button class="yr-tab proj">FY 31-Mar-26 · Proj</button>
```

After (dynamic, with data):
```html
<button class="yr-tab active">FY 31-Mar-23 · Aud
  <span class="badge">✓ 2 files</span>
</button>
<button class="yr-tab">FY 31-Mar-24 · Aud
  <span class="badge">✓ 1 file</span>
</button>
<button class="yr-tab">FY 31-Mar-25 · Aud
  <span class="badge">✓ 2 files</span>
</button>
<button class="yr-tab proj">FY 31-Mar-26 · Proj
  <span class="badge">⚠ Need Data</span>
</button>
```

### 7. **Trend Analysis Automatic Calculation**

```
Once 3 years of data uploaded:

Year          Net Sales    EBITDA    PAT       DSCR
───────────────────────────────────────────────────
FY2023        174.70       32.50     15.80     1.92 (↑ baseline)
FY2024        196.20 (↑12%)36.80 (↑13%) 18.20 (↑15%) 2.10 (↑ improving)
FY2025        218.40 (↑11%)40.20 (↑9%)  20.60 (↑13%) 2.24 (↑ stable)

Growth Trend: ✓ Consistent 10-15% YoY growth
```

### 8. **UI Flow**

**Step 1: Upload Screen**
```
┌─ Financial Documents Upload ─────────────────┐
│                                              │
│ Select files for financial analysis:         │
│ - 3 years P&L & Balance Sheets               │
│ - All formats: PDF, Word, Excel              │
│                                              │
│ [Drag files here] or [Browse]                │
│                                              │
│ Uploaded Files:                              │
│ ✓ FY2023_P&L.pdf (P&L, Year: 2023)          │
│ ✓ FY2023_BS.pdf (BS, Year: 2023)            │
│ ✓ FY2024_P&L.pdf (P&L, Year: 2024)          │
│ ✓ FY2024_BS.pdf (BS, Year: 2024)            │
│                                              │
│ [+ Add More Files] [Continue →]              │
└──────────────────────────────────────────────┘
```

**Step 2: Review & Edit**
```
Year Tabs (Auto-populated from uploads):
[FY 2023 ✓] [FY 2024 ✓] [FY 2025 ✓]

Select FY 2023:
┌─────────────────────────────────────┐
│ P&L Statement - FY 2023             │
├─────────────────────────────────────┤
│ Net Sales:    174.70 ✓ (from PDF)   │
│ EBITDA:        32.50 ✓ (from PDF)   │
│ PAT:           15.80 ✓ (from PDF)   │
│                                     │
│ [Source: FY2023_P&L.pdf]            │
│ [Edit] [Verify] [Re-extract]        │
└─────────────────────────────────────┘
```

### 9. **Implementation Checklist**

#### Phase 1: Data Structure
- [ ] Create `yearsData` object to store multi-year financials
- [ ] Add `state.uploadedFiles` to track file sources
- [ ] Modify extraction functions to map to specific year

#### Phase 2: Upload UI
- [ ] Create multi-file upload interface
- [ ] Add year detection logic
- [ ] Add document type detection
- [ ] Show file processing status

#### Phase 3: Year Tab Integration
- [ ] Dynamically populate year tabs from uploaded data
- [ ] Show file count badges on tabs
- [ ] Allow editing per year
- [ ] Store edits back to yearsData

#### Phase 4: Trend Analysis
- [ ] Calculate YoY growth percentages
- [ ] Auto-populate Trend Analysis section
- [ ] Add growth indicators (↑↓→)
- [ ] Flag anomalies (sharp drops/spikes)

#### Phase 5: Assessment Integration
- [ ] Use multi-year data for DSCR trend
- [ ] Calculate 3-year average metrics
- [ ] Show historical performance in assessment

### 10. **Example Multi-Year Assessment**

```
Client: ABC Manufacturing
Uploaded: 3 years (FY2023, FY2024, FY2025)

Financial Metrics (3-Year Average):
├─ Net Sales: ₹196.43 Cr (avg)
├─ EBITDA: ₹36.50 Cr (avg)
├─ Growth Trajectory: ↑ Positive (12% CAGR)
└─ Stability: ✓ Consistent

Trend Analysis:
┌─────────────────────────────────────────┐
│ Metric      2023    2024    2025  CAGR  │
├─────────────────────────────────────────┤
│ Sales       174.7   196.2   218.4 11.8% │
│ EBITDA       32.5    36.8    40.2  11.2%│
│ PAT          15.8    18.2    20.6  14.3%│
│ DSCR          1.92   2.10    2.24   --  │
│ Debt/ATNW     1.23   1.18    1.12 ↓    │
└─────────────────────────────────────────┘

Recommendation: ✓ STRONG GROWTH PROFILE
- Consistent revenue growth
- Improving leverage metrics
- Healthy profit margins
- Stable cash generation
```

---

## Implementation Effort

| Component | Files | LOC | Complexity |
|-----------|-------|-----|------------|
| Data structure | HTML + JS | 50 | Low |
| Upload UI | HTML + CSS | 100 | Medium |
| Year detection | JS | 80 | Medium |
| Year tab population | JS | 120 | High |
| Trend calculation | JS | 150 | Medium |
| Assessment integration | JS | 100 | Medium |
| **Total** | | **~600** | **Medium-High** |

---

## Benefits

✅ Support for multi-year financial analysis  
✅ Automatic trend detection  
✅ Better credit assessment quality  
✅ Reduced manual data entry  
✅ Audit trail of source documents  
✅ Individual & Company both supported  

---

## Alternative Approaches

### Option A: Batch Upload (Recommended)
- User uploads all files at once (3-5 files)
- System auto-detects years and document types
- Complexity: High, but best UX

### Option B: Sequential Upload
- Upload one file → select year/type → upload next
- User manually specifies year for each file
- Complexity: Low, but tedious for users

### Option C: Manual Entry
- Keep current system
- User manually enters data for multiple years in tabs
- Complexity: Lowest, but defeats automation purpose

---

**Status**: 📋 **DESIGN READY** - Awaiting approval to implement

Should I proceed with **Option A: Batch Upload**?
