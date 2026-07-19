# FinPro - Credit Assessment Module

A comprehensive credit assessment and loan structuring application supporting both **Company** and **Individual** borrowers with multi-year financial analysis capabilities.

**Stack:** Vanilla HTML/CSS/JavaScript · LocalStorage (no database) · Browser-based

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Features](#core-features)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Data Storage](#data-storage)
7. [Calculation Formulas](#calculation-formulas)
8. [Testing](#testing)
9. [Documentation Files](#documentation-files)
10. [Example Workflows](#example-workflows)
11. [Development](#development)
12. [Common Issues](#common-issues)
13. [Version History](#version-history)

---

## Overview

**FinPro** is a standalone web-based credit assessment system designed for financial institutions to:

- ✅ Assess creditworthiness for company and individual borrowers
- ✅ Calculate loan capacity using DSCR (companies) and FOIR (individuals)
- ✅ Upload and analyze multi-year financial statements (batch processing)
- ✅ Generate dynamic loan structuring options
- ✅ Perform stress scenario analysis
- ✅ Display trend analysis across years
- ✅ Create comprehensive assessment reports

---

## Quick Start

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- No installation required
- No database setup needed (all data stored in browser/localStorage)

### Launch
```bash
# Simply open the HTML file in your browser
C:\Users\Welcome\Desktop\FinPro\cam-website.html

# Or using File Explorer:
# 1. Right-click cam-website.html
# 2. Open with → Google Chrome (or your browser)
```

### First Use
1. **Login Screen** → Enter any credentials (demo mode)
2. **Choose Mode** → "Company" or "Individual"
3. **Enter CAM Details** → Customer information
4. **Upload Financials** → Multi-year documents
5. **Review Assessment** → Auto-generated loan options
6. **Generate Report** → Download assessment

---

## Core Features

### 1. Dual-Mode Operation

#### Company Mode
- Business financials analysis
- Multi-year P&L and Balance Sheet support
- DSCR-based loan capacity calculation
- Working Capital, Term Loans, LAP, CGTMSE products
- Business-specific risk assessment

#### Individual Mode
- Salary and employment verification
- FOIR-based loan capacity calculation
- Personal, Home, Vehicle, Education loans
- Employment stability analysis
- CIBIL score integration

### 2. Multi-Year Financial Upload 📁

**Batch Upload Features:**
- Drag-and-drop interface for multiple files
- Auto-detection of year from filename
- Automatic document type detection (P&L vs Balance Sheet)
- Support for PDF, Word, Excel documents
- Dynamic year tab generation
- Manual editing of extracted values

### 3. Financial Data Extraction

**From P&L Statement:**
- Net Sales, EBITDA, PAT
- Interest Expense, Depreciation
- Net Cash Accruals (NCA)

**From Balance Sheet:**
- Total Assets, Total Liabilities, Equity
- Current Assets, Current Liabilities
- TNW (Tangible Net Worth), ATNW
- Total Debt breakdown

### 4. Loan Structuring

#### Company Mode - DSCR Based
- Loan Capacity = Min(NCA ÷ 1.25, ATNW × 3.5 - Current Debt)
- Multiple tenure options (3yr, 5yr, 7yr)

#### Individual Mode - FOIR Based
- Available EMI = Salary × (55% - Current FOIR%)
- Conservative, Balanced, Aggressive options

### 5. Scenario Analysis

#### Company Mode
- **Base Case**, **Stress**, **Worst Case**
- Shows DSCR impact

#### Individual Mode
- **Base Case**, **Stress**, **Worst Case**
- Shows FOIR impact

---

## Project Structure

```
FinPro/
├── cam-website.html              # Main application (single-file)
├── README.md                     # This file
├── SETUP_ENVIRONMENT.md          # Environment and deployment guide
├── IMPLEMENTATION_SUMMARY.md     # Technical implementation details
├── INDIVIDUAL_MODE_IMPLEMENTATION.md # Individual mode specifications
├── MULTI_YEAR_UPLOAD_GUIDE.md    # User guide for file uploads
├── TEST_RESULTS.md              # Test coverage and results
└── CLAUDE.md                    # Development guidelines
```

---

## Architecture

### Technology Stack
- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Storage**: Browser localStorage + in-memory state
- **UI Pattern**: Single-page application with screen transitions
- **Data Format**: JSON for all internal data structures

### Core Components
1. **Login & User Management** - Demo login, customer type selection
2. **CAM Details** - Customer information, dynamic fields
3. **Banking Tab** - Account analysis, FOIR calculation
4. **Financials/Income Tab** - Multi-year analysis with dynamic tabs
5. **Loan Requirements** - Product and amount specification
6. **Assessment Tabs** - Structuring, scenarios, trends
7. **Report Generation** - Comprehensive PDF export

---

## Data Storage

### LocalStorage Keys
- `camData_{customerName}` - Customer CAM details
- `yearsData_{customerName}` - Multi-year financials
- `assessmentData_{customerName}` - Generated assessments
- `currentSession` - Active user information

### Data Persistence
- All data stored in browser localStorage
- No server required
- Data persists across browser sessions
- Can be cleared via browser settings

---

## Calculation Formulas

### Company Mode (DSCR)

**DSCR Calculation:**
```
DSCR = Net Cash Accruals / Annual Debt Service
Annual Debt Service = Current year EMI × 12
```

**Loan Capacity:**
```
Capacity = Min(NCA ÷ 1.25, ATNW × 3.5 - Current Debt)
```

### Individual Mode (FOIR)

**FOIR Calculation:**
```
FOIR = Total Monthly Obligations / Gross Monthly Income
Available EMI = Gross Salary × (55% - Current FOIR%)
```

---

## Testing

### Test Coverage
- ✅ Company mode field visibility
- ✅ Individual mode field visibility
- ✅ Multi-file batch upload
- ✅ Year detection from filenames
- ✅ Document type detection
- ✅ Financial data extraction
- ✅ Year tab generation
- ✅ Trend calculations
- ✅ DSCR and FOIR calculations
- ✅ Loan structuring options
- ✅ Scenario analysis
- ✅ Report generation

See **TEST_RESULTS.md** for detailed test cases.

---

## Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | This file - project overview |
| **SETUP_ENVIRONMENT.md** | Environment setup, deployment, hosting |
| **IMPLEMENTATION_SUMMARY.md** | Technical implementation details |
| **INDIVIDUAL_MODE_IMPLEMENTATION.md** | Individual mode specifications |
| **MULTI_YEAR_UPLOAD_GUIDE.md** | User guide for file uploads |
| **TEST_RESULTS.md** | Test coverage and verification |
| **CLAUDE.md** | Development guidelines |

---

## Example Workflows

### Company Loan Assessment (3 years)
1. Login → Select "Company"
2. Enter business info
3. Drag FY2023-2025 P&L and BS files
4. System auto-detects years and types
5. Review extracted data in year tabs
6. Enter loan requirement
7. Generate assessment (DSCR-based)
8. View trends and scenarios
9. Download report

### Individual Loan Assessment
1. Login → Select "Individual"
2. Enter personal and employment info
3. Specify salary and current EMI
4. Enter loan requirement
5. Generate assessment (FOIR-based)
6. View FOIR scenarios
7. Download report

---

## Development

### Code Organization
- Single HTML file: `cam-website.html`
- ~5000+ lines of code
- All CSS and JavaScript embedded
- No external dependencies

### Extending the App

**To add a new field:**
1. Add HTML input in appropriate section
2. Add CSS class (.company-only or .individual-only if mode-specific)
3. Update extraction logic
4. Add to calculation if needed

**To add a new calculation:**
1. Create new function
2. Call from `renderAssessment()`
3. Add test case to TEST_RESULTS.md

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Files not uploading | Ensure PDF is searchable; check filename includes year |
| Data extraction inaccurate | Verify P&L/BS format; manually edit values if needed |
| Year tabs not appearing | Click "Generate Year Tabs" button; check browser console |
| Performance slow | Clear localStorage; use modern browser (Chrome/Firefox) |

---

## Version History

**v2.0.0** - Multi-Year Financial Upload
- ✅ Batch file upload support
- ✅ Year and document type detection
- ✅ Dynamic year tab generation
- ✅ Trend analysis and CAGR calculation

**v1.5.0** - Individual Mode Support
- ✅ Dual-mode operation
- ✅ FOIR-based loan calculations
- ✅ Individual-specific products

**v1.0.0** - Initial Release
- ✅ Company loan assessment
- ✅ DSCR-based sizing
- ✅ Basic scenario analysis
- ✅ Report generation
