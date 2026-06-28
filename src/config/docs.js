export const DOCS = {
  company: [
    { id: 'kyc', name: 'KYC / Identity', sub: 'PAN, Aadhaar of promoters', ic: 'ti-id', req: true, fields: [{ k: 'PAN', v: 'ABCDE1234F' }, { k: 'Promoter name', v: 'Anil Mehta' }, { k: 'Address', v: 'Pune, Maharashtra' }] },
    { id: 'biz', name: 'Business proof', sub: 'GST certificate, Udyam/MSME', ic: 'ti-file-certificate', req: true, fields: [{ k: 'GSTIN', v: '22ABCDE1234F1Z5' }, { k: 'Constitution', v: 'Proprietorship' }, { k: 'Udyam no.', v: 'UDYAM-MH-12-0034567' }, { k: 'Industry', v: 'Engineering goods mfg' }] },
    { id: 'fin', name: 'Income / financials', sub: 'ITR, P&L, balance sheet', ic: 'ti-report-money', req: true, fields: [{ k: 'Net sales (₹Cr)', v: '174.70' }, { k: 'EBITDA (₹Cr)', v: '32.50' }, { k: 'PAT (₹Cr)', v: '15.80' }, { k: 'Total debt (₹Cr)', v: '44.50' }, { k: 'Reserves (₹Cr)', v: '28.60' }, { k: 'Depreciation (₹Cr)', v: '5.80' }] },
    { id: 'bank', name: 'Bank statements', sub: 'All accounts · 12 months', ic: 'ti-building-bank', req: true, fields: [{ k: 'Bank & A/C', v: 'SBI / 4521xx' }, { k: 'Avg credits (₹Cr/mo)', v: '12.40' }, { k: 'Inward returns', v: '3' }, { k: 'Sanction limit (₹Cr)', v: '25.00' }] },
    { id: 'prop', name: 'Property documents', sub: 'Sale deed, valuation report', ic: 'ti-home-2', req: false, fields: [{ k: 'Market value (₹Cr)', v: '85.00' }, { k: 'Type', v: 'Commercial' }, { k: 'Location', v: 'Pune, Kothrud' }] },
    { id: 'other', name: 'Other documents', sub: 'MOA, partnership deed, SOA', ic: 'ti-files', req: false, fields: [{ k: 'Document', v: 'Partnership deed' }, { k: 'Statement of a/c', v: 'Attached' }] },
  ],
  individual: [
    { id: 'kyc', name: 'KYC / Identity', sub: 'Aadhaar + PAN card', ic: 'ti-id', req: true, fields: [{ k: 'PAN', v: 'ABCDE1234F' }, { k: 'Aadhaar', v: 'xxxx-xxxx-1234' }, { k: 'Name', v: 'Rahul Sharma' }, { k: 'DOB', v: '12-Jun-1986' }] },
    { id: 'salary', name: 'Salary slips', sub: 'Last 6 months', ic: 'ti-receipt', req: true, fields: [{ k: 'Net salary (₹/mo)', v: '185000' }, { k: 'Employer', v: 'Acme Tech Pvt Ltd' }, { k: 'Gross (₹/mo)', v: '240000' }, { k: 'Deductions (₹/mo)', v: '55000' }] },
    { id: 'form16', name: 'Form 16', sub: 'TDS certificate · 2 years', ic: 'ti-file-invoice', req: true, fields: [{ k: 'Gross income (₹)', v: '2880000' }, { k: 'TDS deducted (₹)', v: '410000' }, { k: 'Taxable income (₹)', v: '2420000' }] },
    { id: 'itr', name: 'ITR statement', sub: 'Last 2 years', ic: 'ti-file-text', req: true, fields: [{ k: 'Total income (₹)', v: '2900000' }, { k: 'Tax paid (₹)', v: '420000' }, { k: 'Refund (₹)', v: '15000' }] },
    { id: 'bank', name: 'Bank statements', sub: 'Salary account · 6 months', ic: 'ti-building-bank', req: true, fields: [{ k: 'Bank & A/C', v: 'HDFC / 8842xx' }, { k: 'Avg balance (₹)', v: '320000' }, { k: 'Inward returns', v: '0' }, { k: 'EMI outflow (₹/mo)', v: '45000' }] },
    { id: 'prop', name: 'Property documents', sub: 'Sale deed, valuation (LAP/HL)', ic: 'ti-home-2', req: false, fields: [{ k: 'Market value (₹L)', v: '85.00' }, { k: 'Type', v: 'Residential flat' }, { k: 'Location', v: 'Pune, Kothrud' }] },
  ],
};

export const SCAN_STEPS = [
  'Initialising parser',
  'Detecting document type',
  'Extracting text layer',
  'Reading financial tables',
  'Mapping fields to CAM',
  'Validating with checksums',
];

export const BREAKDOWN = [
  ['Consumer CIBIL', '15/15', true],
  ['Commercial CMR', '10/10', true],
  ['Current ratio', '8/8', true],
  ['DSCR', '11/15', false],
  ['TOL / ATNW', '7/10', false],
  ['EBITDA positive', '10/10', true],
  ['Net worth', '8/8', true],
  ['Promoter vintage', '10/10', true],
  ['Promoter age', '4/4', true],
  ['Cheque bounces', '0/5', false],
];

export const RATIOS = [
  ['Current ratio', '1.82', 'ok'],
  ['Quick ratio', '1.24', 'ok'],
  ['D / E', '1.48', 'ok'],
  ['DSCR', '1.92', 'ok'],
  ['ICR', '3.87', 'ok'],
  ['TOL/ATNW', '2.10', 'ok'],
  ['EBITDA %', '18.6%', 'ok'],
  ['Net margin', '9.0%', 'ok'],
  ['ROE', '41%', 'ok'],
  ['ROCE', '22%', 'ok'],
  ['Inv. days', '42', 'warn'],
  ['CCC', '51 d', 'warn'],
];

export const TREND = [
  ['Net sales', '174.70', '196.20', '218.40', '242.00', 'up'],
  ['EBITDA', '32.50', '36.80', '40.20', '45.00', 'up'],
  ['PAT', '15.80', '18.20', '20.60', '24.00', 'up'],
  ['NCA', '21.60', '24.00', '26.40', '29.80', 'up'],
  ['Total debt', '44.50', '42.00', '38.50', '34.00', 'down'],
  ['ATNW', '36.20', '41.60', '47.80', '55.00', 'up'],
  ['DSCR', '1.92', '2.10', '2.24', '2.38', 'up'],
  ['D / E', '1.48', '1.21', '0.98', '0.75', 'down'],
];

export const FINAL_SCORE = 68;
