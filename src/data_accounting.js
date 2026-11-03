// RestoERP Accounting Module — Demo Data
// Follows Odoo Chart of Accounts structure for Tanzania (TZ)

export const fmt = n => 'TSh ' + Math.round(n || 0).toLocaleString('en-US');
export const fmtNum = n => Number(n || 0).toLocaleString('en-US');

const now = Date.now();
const d = (daysAgo) => new Date(Date.now() - daysAgo * 86400000);
const ds = (daysAgo) => d(daysAgo).toISOString().slice(0, 10);

// ─── CHART OF ACCOUNTS ────────────────────────────────────────────────────────
export const CHART_OF_ACCOUNTS = [
  // ASSETS
  { id: 'acc_1001', code: '1001', name: 'Salaries and Wages Expense', type: 'expense', category: 'Expenses', normal: 'debit' },
  { id: 'acc_1002', code: '1002', name: 'Employer NSSF Expense', type: 'expense', category: 'Expenses', normal: 'debit' },
  { id: 'acc_1003', code: '1003', name: 'SDL Expense', type: 'expense', category: 'Expenses', normal: 'debit' },
  { id: 'acc_1004', code: '1004', name: 'WCF Expense', type: 'expense', category: 'Expenses', normal: 'debit' },
  { id: 'acc_1031', code: '1031', name: 'Bank', type: 'asset', category: 'Bank & Cash', normal: 'debit' },
  { id: 'acc_1032', code: '1032', name: 'Bank Suspense Account', type: 'asset', category: 'Bank & Cash', normal: 'debit' },
  { id: 'acc_1033', code: '1033', name: 'Outstanding Receipts', type: 'asset', category: 'Bank & Cash', normal: 'debit' },
  { id: 'acc_1501', code: '1501', name: 'CRDB - Cash on Hand', type: 'asset', category: 'Bank & Cash', normal: 'debit' },
  { id: 'acc_1518', code: '1518', name: 'Accounts Receivable', type: 'receivable', category: 'Receivables', normal: 'debit' },
  { id: 'acc_1900', code: '1900', name: 'Receivables And Contracts', type: 'receivable', category: 'Receivables', normal: 'debit' },
  { id: 'acc_2001', code: '2001', name: 'Paye Payable', type: 'liability', category: 'Tax Payables', normal: 'credit' },
  { id: 'acc_2002', code: '2002', name: 'NSSF Payable', type: 'liability', category: 'Tax Payables', normal: 'credit' },
  { id: 'acc_2003', code: '2003', name: 'SDL Payable', type: 'liability', category: 'Tax Payables', normal: 'credit' },
  { id: 'acc_2004', code: '2004', name: 'WCF Payable', type: 'liability', category: 'Tax Payables', normal: 'credit' },
  { id: 'acc_3001', code: '3001', name: 'Share Capital', type: 'equity', category: 'Equity', normal: 'credit' },
  { id: 'acc_3002', code: '3002', name: 'Retained Earnings', type: 'equity', category: 'Equity', normal: 'credit' },
  { id: 'acc_4000', code: '4000', name: 'Sales Revenue', type: 'income', category: 'Income', normal: 'credit' },
  { id: 'acc_4001', code: '4001', name: 'Food & Beverage Revenue', type: 'income', category: 'Income', normal: 'credit' },
  { id: 'acc_4507', code: '4507', name: 'Identity Cards Income', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_4513', code: '4513', name: 'Miscellaneous Income', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_4516', code: '4516', name: 'Application fee', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_4517', code: '4517', name: 'Administrative cost', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_4518', code: '4518', name: 'Special Faculty', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_4519', code: '4519', name: 'MUMSO fee', type: 'income', category: 'Other Income', normal: 'credit' },
  { id: 'acc_5001', code: '5001', name: 'Cost of Goods Sold', type: 'expense', category: 'COGS', normal: 'debit' },
  { id: 'acc_5005', code: '5005', name: 'Water Expenses', type: 'expense', category: 'Operating Expenses', normal: 'debit' },
  { id: 'acc_5006', code: '5006', name: 'Electricity Expenses', type: 'expense', category: 'Operating Expenses', normal: 'debit' },
  { id: 'acc_5007', code: '5007', name: 'Gas & Fuel Expenses', type: 'expense', category: 'Operating Expenses', normal: 'debit' },
  { id: 'acc_5008', code: '5008', name: 'Cleaning & Hygiene', type: 'expense', category: 'Operating Expenses', normal: 'debit' },
  { id: 'acc_5052', code: '5052', name: 'TCU Annual subscription', type: 'expense', category: 'Operating Expenses', normal: 'debit' },
  { id: 'acc_6001', code: '6001', name: 'Trade Payables', type: 'payable', category: 'Payables', normal: 'credit' },
  { id: 'acc_6002', code: '6002', name: 'VAT Payable (18%)', type: 'liability', category: 'Tax Payables', normal: 'credit' },
  { id: 'acc_6003', code: '6003', name: 'Other Liabilities', type: 'liability', category: 'Current Liabilities', normal: 'credit' },
  { id: 'acc_7001', code: '7001', name: 'Investments', type: 'asset', category: 'Non-Current Assets', normal: 'debit' },
  { id: 'acc_7002', code: '7002', name: 'Property & Equipment', type: 'asset', category: 'Non-Current Assets', normal: 'debit' },
];

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
export const CUSTOMERS = [
  { id: 'cust_1', name: 'Juma Rashid', ref: 'CUST-001', phone: '+255 712 000 111', email: 'juma.r@gmail.com', type: 'individual', credit: 0, country: 'TZ', city: 'Dar es Salaam', balance: 120000, overdue: 45000 },
  { id: 'cust_2', name: 'Safari Holdings Ltd', ref: 'CUST-002', phone: '+255 784 220 330', email: 'accounts@safariholding.tz', type: 'company', credit: 500000, country: 'TZ', city: 'Dar es Salaam', balance: 890000, overdue: 0 },
  { id: 'cust_3', name: 'Marriott Hotel Dar', ref: 'CUST-003', phone: '+255 22 211 7000', email: 'procurement@marriott.co.tz', type: 'company', credit: 2000000, country: 'TZ', city: 'Dar es Salaam', balance: 2400000, overdue: 600000 },
  { id: 'cust_4', name: 'Fatima Enterprises', ref: 'CUST-004', phone: '+255 755 441 221', email: 'fatima@fatima.tz', type: 'company', credit: 300000, country: 'TZ', city: 'Arusha', balance: 175000, overdue: 0 },
  { id: 'cust_5', name: 'Nelson Mandela Event Co.', ref: 'CUST-005', phone: '+255 713 995 004', email: 'events@nelsonevents.co.tz', type: 'company', credit: 1000000, country: 'TZ', city: 'Dar es Salaam', balance: 560000, overdue: 200000 },
];

// ─── VENDORS ─────────────────────────────────────────────────────────────────
export const VENDORS = [
  { id: 'vend_1', name: 'Serengeti Meats & Poultry', ref: 'VEND-001', phone: '+255 784 112 233', email: 'bakari@serengeti.tz', type: 'company', terms: 'Net 15', country: 'TZ', city: 'Dar es Salaam', balance: 422500, overdue: 0 },
  { id: 'vend_2', name: 'Farm Fresh Tanzania Ltd', ref: 'VEND-002', phone: '+255 715 443 322', email: 'salma@farmfresh.tz', type: 'company', terms: 'Net 7', country: 'TZ', city: 'Morogoro', balance: 225000, overdue: 225000 },
  { id: 'vend_3', name: 'Kibo Food & Beverage Supplies', ref: 'VEND-003', phone: '+255 754 887 766', email: 'kibo@kibofood.tz', type: 'company', terms: 'Net 30', country: 'TZ', city: 'Dar es Salaam', balance: 176000, overdue: 0 },
  { id: 'vend_4', name: 'TANESCO', ref: 'VEND-004', phone: '+255 22 211 6000', email: 'billing@tanesco.go.tz', type: 'company', terms: 'Prepaid', country: 'TZ', city: 'Dar es Salaam', balance: 180000, overdue: 0 },
  { id: 'vend_5', name: 'Oryx Petroleum Tanzania', ref: 'VEND-005', phone: '+255 22 211 8800', email: 'commercial@oryx.tz', type: 'company', terms: 'Cash', country: 'TZ', city: 'Dar es Salaam', balance: 120000, overdue: 0 },
];

// ─── CUSTOMER INVOICES ────────────────────────────────────────────────────────
export const INVOICES = [
  {
    id: 'inv_001', no: 'INV/2026/0001', date: ds(30), due: ds(15), partner: 'Marriott Hotel Dar', partnerId: 'cust_3',
    type: 'out_invoice', state: 'open', currency: 'TZS',
    lines: [
      { description: 'Catering Services — Oct 2026', account: 'acc_4001', qty: 1, price: 1800000, tax: 18 },
      { description: 'Event Setup & Logistics', account: 'acc_4001', qty: 1, price: 600000, tax: 18 },
    ],
    subtotal: 2400000, tax_amount: 432000, total: 2832000, paid: 2232000, balance: 600000,
    ref: 'MARRIOTT-OCT-2026', notes: 'Monthly catering contract invoice'
  },
  {
    id: 'inv_002', no: 'INV/2026/0002', date: ds(25), due: ds(10), partner: 'Nelson Mandela Event Co.', partnerId: 'cust_5',
    type: 'out_invoice', state: 'open', currency: 'TZS',
    lines: [
      { description: 'Private Event Dining — 80 Pax', account: 'acc_4001', qty: 80, price: 35000, tax: 18 },
    ],
    subtotal: 2800000, tax_amount: 504000, total: 3304000, paid: 2804000, balance: 500000,
    ref: 'EVENT-NOV2026-01', notes: 'Gala dinner booking'
  },
  {
    id: 'inv_003', no: 'INV/2026/0003', date: ds(5), due: ds(-10), partner: 'Safari Holdings Ltd', partnerId: 'cust_2',
    type: 'out_invoice', state: 'paid', currency: 'TZS',
    lines: [
      { description: 'Corporate Lunch Package — Weekly', account: 'acc_4001', qty: 4, price: 222500, tax: 18 },
    ],
    subtotal: 890000, tax_amount: 160200, total: 1050200, paid: 1050200, balance: 0,
    ref: 'SAFHOLD-OCT2026', notes: 'Paid in full'
  },
  {
    id: 'inv_004', no: 'INV/2026/0004', date: ds(3), due: ds(-7), partner: 'Fatima Enterprises', partnerId: 'cust_4',
    type: 'out_invoice', state: 'open', currency: 'TZS',
    lines: [
      { description: 'Staff Catering — Oct 2026', account: 'acc_4001', qty: 1, price: 175000, tax: 18 },
    ],
    subtotal: 175000, tax_amount: 31500, total: 206500, paid: 0, balance: 175000,
    ref: 'FATIMA-NOV26', notes: 'Awaiting payment'
  },
  {
    id: 'inv_005', no: 'INV/2026/0005', date: ds(1), due: ds(-14), partner: 'Juma Rashid', partnerId: 'cust_1',
    type: 'out_invoice', state: 'open', currency: 'TZS',
    lines: [
      { description: 'Special Occasion Dinner — Booking Deposit', account: 'acc_4001', qty: 1, price: 120000, tax: 0 },
    ],
    subtotal: 120000, tax_amount: 0, total: 120000, paid: 75000, balance: 45000,
    ref: 'JUMA-DEPOSIT', notes: 'Deposit received'
  },
];

// ─── VENDOR BILLS ─────────────────────────────────────────────────────────────
export const BILLS = [
  {
    id: 'bill_001', no: 'BILL/2026/0001', date: ds(6), due: ds(9), partner: 'Serengeti Meats & Poultry', partnerId: 'vend_1',
    type: 'in_invoice', state: 'paid', currency: 'TZS',
    lines: [
      { description: 'Fresh Whole Chicken 25kg @ 8,500', account: 'acc_5001', qty: 25, price: 8500, tax: 0 },
      { description: 'Prime Beef Tenderloin 15kg @ 14,000', account: 'acc_5001', qty: 15, price: 14000, tax: 0 },
    ],
    subtotal: 422500, tax_amount: 0, total: 422500, paid: 422500, balance: 0,
    ref: 'PO-881', notes: 'Received and verified'
  },
  {
    id: 'bill_002', no: 'BILL/2026/0002', date: ds(1), due: ds(-6), partner: 'Farm Fresh Tanzania Ltd', partnerId: 'vend_2',
    type: 'in_invoice', state: 'open', currency: 'TZS',
    lines: [
      { description: 'Kilombero Mangoes 30kg @ 2,500', account: 'acc_5001', qty: 30, price: 2500, tax: 0 },
      { description: 'Lushoto Passion Fruit 15kg @ 4,000', account: 'acc_5001', qty: 15, price: 4000, tax: 0 },
      { description: 'Mbeya Red Potatoes 50kg @ 1,800', account: 'acc_5001', qty: 50, price: 1800, tax: 0 },
    ],
    subtotal: 225000, tax_amount: 0, total: 225000, paid: 0, balance: 225000,
    ref: 'PO-882', notes: 'Awaiting payment approval'
  },
  {
    id: 'bill_003', no: 'BILL/2026/0003', date: ds(24), due: ds(6), partner: 'TANESCO', partnerId: 'vend_4',
    type: 'in_invoice', state: 'paid', currency: 'TZS',
    lines: [
      { description: 'TANESCO Commercial Electricity — Oct 2026', account: 'acc_5006', qty: 1, price: 180000, tax: 0 },
    ],
    subtotal: 180000, tax_amount: 0, total: 180000, paid: 180000, balance: 0,
    ref: 'TAN-44129', notes: 'Monthly utility bill'
  },
  {
    id: 'bill_004', no: 'BILL/2026/0004', date: ds(48), due: ds(18), partner: 'Oryx Petroleum Tanzania', partnerId: 'vend_5',
    type: 'in_invoice', state: 'paid', currency: 'TZS',
    lines: [
      { description: 'Oryx Bulk LPG Gas Refill (Grill)', account: 'acc_5007', qty: 1, price: 120000, tax: 0 },
    ],
    subtotal: 120000, tax_amount: 0, total: 120000, paid: 120000, balance: 0,
    ref: 'ORYX-9912', notes: ''
  },
];

// ─── JOURNAL ENTRIES ──────────────────────────────────────────────────────────
export const JOURNAL_ENTRIES = [
  {
    id: 'je_001', no: 'JE/2026/00001', date: ds(30), journal: 'Sales Journal', state: 'posted', ref: 'INV/2026/0001',
    lines: [
      { account: '1518', name: 'Accounts Receivable', debit: 2832000, credit: 0, partner: 'Marriott Hotel Dar' },
      { account: '4001', name: 'Food & Beverage Revenue', debit: 0, credit: 2400000, partner: '' },
      { account: '6002', name: 'VAT Payable (18%)', debit: 0, credit: 432000, partner: '' },
    ]
  },
  {
    id: 'je_002', no: 'JE/2026/00002', date: ds(6), journal: 'Purchase Journal', state: 'posted', ref: 'BILL/2026/0001',
    lines: [
      { account: '5001', name: 'Cost of Goods Sold', debit: 422500, credit: 0, partner: '' },
      { account: '6001', name: 'Trade Payables', debit: 0, credit: 422500, partner: 'Serengeti Meats & Poultry' },
    ]
  },
  {
    id: 'je_003', no: 'JE/2026/00003', date: ds(24), journal: 'Bank', state: 'posted', ref: 'TAN-44129',
    lines: [
      { account: '5006', name: 'Electricity Expenses', debit: 180000, credit: 0, partner: '' },
      { account: '1031', name: 'Bank', debit: 0, credit: 180000, partner: 'TANESCO' },
    ]
  },
  {
    id: 'je_004', no: 'JE/2026/00004', date: ds(3), journal: 'Sales Journal', state: 'posted', ref: 'INV/2026/0003',
    lines: [
      { account: '1031', name: 'Bank', debit: 1050200, credit: 0, partner: 'Safari Holdings Ltd' },
      { account: '1518', name: 'Accounts Receivable', debit: 0, credit: 1050200, partner: '' },
    ]
  },
  {
    id: 'je_005', no: 'JE/2026/00005', date: ds(0), journal: 'Payroll Journal', state: 'posted', ref: 'PAYROLL-NOV-2026',
    lines: [
      { account: '1001', name: 'Salaries and Wages Expense', debit: 5186000, credit: 0, partner: '' },
      { account: '1002', name: 'Employer NSSF Expense', debit: 518600, credit: 0, partner: '' },
      { account: '1003', name: 'SDL Expense', debit: 28000, credit: 0, partner: '' },
      { account: '1004', name: 'WCF Expense', debit: 4000, credit: 0, partner: '' },
      { account: '1031', name: 'Bank', debit: 0, credit: 5736600, partner: '' },
    ]
  },
];

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const PAYMENTS = [
  { id: 'pay_001', date: ds(3), no: 'PAY-001', partner: 'Safari Holdings Ltd', type: 'inbound', amount: 1050200, method: 'bank', ref: 'SAFHOLD-PAY', memo: 'INV/2026/0003 full settlement', journal: 'Bank' },
  { id: 'pay_002', date: ds(25), no: 'PAY-002', partner: 'Marriott Hotel Dar', type: 'inbound', amount: 2232000, method: 'bank', ref: 'MARRIOTT-PAY-1', memo: 'Partial payment INV/2026/0001', journal: 'Bank' },
  { id: 'pay_003', date: ds(6), no: 'PAY-003', partner: 'Serengeti Meats & Poultry', type: 'outbound', amount: 422500, method: 'bank', ref: 'SETTLE-PO881', memo: 'BILL/2026/0001 settlement', journal: 'Bank' },
  { id: 'pay_004', date: ds(24), no: 'PAY-004', partner: 'TANESCO', type: 'outbound', amount: 180000, method: 'bank', ref: 'TAN-44129', memo: 'Electricity bill payment', journal: 'Bank' },
  { id: 'pay_005', date: ds(48), no: 'PAY-005', partner: 'Oryx Petroleum Tanzania', type: 'outbound', amount: 120000, method: 'cash', ref: 'ORYX-9912', memo: 'LPG refill - cash', journal: 'Cash' },
];

// ─── BANK ACCOUNTS ───────────────────────────────────────────────────────────
export const BANK_ACCOUNTS = [
  { id: 'bank_1', name: 'CRDB Business Account', bank: 'CRDB Bank', number: '0150194874500', currency: 'TZS', balance: 10300200, lastSync: ds(0) },
  { id: 'bank_2', name: 'NMB Operational Account', bank: 'NMB Bank', currency: 'TZS', number: '40310100041', balance: 3450000, lastSync: ds(1) },
];

// ─── GENERAL LEDGER DATA ─────────────────────────────────────────────────────
export const GENERAL_LEDGER = [
  { code: '1001', name: 'Salaries and Wages Expense', currency: 'TSh', debit: 5186000, credit: 0, balance: 5186000 },
  { code: '1002', name: 'Employer NSSF Expense', currency: 'TSh', debit: 518600, credit: 0, balance: 518600 },
  { code: '1003', name: 'SDL Expense', currency: 'TSh', debit: 28000, credit: 0, balance: 28000 },
  { code: '1004', name: 'WCF Expense', currency: 'TSh', debit: 4000, credit: 0, balance: 4000 },
  { code: '1031', name: 'Bank', currency: 'TSh', debit: 23650200, credit: 13350000, balance: 10300200 },
  { code: '1032', name: 'Bank Suspense Account', currency: 'TSh', debit: 0, credit: 0, balance: 0 },
  { code: '1033', name: 'Outstanding Receipts', currency: 'TSh', debit: 81040400, credit: 28633200, balance: 53207200 },
  { code: '1501', name: 'CRDB - Cash on Hand', currency: 'TSh', debit: 0, credit: 15000, balance: -15000 },
  { code: '1518', name: 'Accounts Receivable', currency: 'TSh', debit: 116299500, credit: 81862400, balance: 34437100 },
  { code: '1900', name: 'Receivables And Contracts', currency: 'TSh', debit: 100000, credit: 100000, balance: 0 },
  { code: '2001', name: 'Paye Payable', currency: 'TSh', debit: 0, credit: 14400, balance: -14400 },
  { code: '4001', name: 'Food & Beverage Revenue', currency: 'TSh', debit: 0, credit: 7985000, balance: -7985000 },
  { code: '4507', name: 'Identity Cards Income', currency: 'TSh', debit: 0, credit: 460000, balance: -460000 },
  { code: '4513', name: 'Miscellaneous Income', currency: 'TSh', debit: 0, credit: 5880000, balance: -5880000 },
  { code: '4516', name: 'Application fee', currency: 'TSh', debit: 0, credit: 25000, balance: -25000 },
  { code: '4517', name: 'Administrative cost', currency: 'TSh', debit: 0, credit: 1400000, balance: -1400000 },
  { code: '4518', name: 'Special Faculty', currency: 'TSh', debit: 0, credit: 600000, balance: -600000 },
  { code: '4519', name: 'MUMSO fee', currency: 'TSh', debit: 75000, credit: 75000, balance: 0 },
  { code: '5001', name: 'Cost of Goods Sold', currency: 'TSh', debit: 845000, credit: 0, balance: 845000 },
  { code: '5005', name: 'Water Expenses', currency: 'TSh', debit: 1000000, credit: 0, balance: 1000000 },
  { code: '5006', name: 'Electricity Expenses', currency: 'TSh', debit: 1500000, credit: 0, balance: 1500000 },
  { code: '5052', name: 'TCU Annual subscription', currency: 'TSh', debit: 0, credit: 1340000, balance: -1340000 },
  { code: '6001', name: 'Trade Payables', currency: 'TSh', debit: 0, credit: 10600000, balance: -10600000 },
  { code: '6002', name: 'VAT Payable (18%)', currency: 'TSh', debit: 0, credit: 432000, balance: -432000 },
];

// ─── TRIAL BALANCE ────────────────────────────────────────────────────────────
export const TRIAL_BALANCE = GENERAL_LEDGER.map(g => ({
  ...g,
  initBalance: g.balance,
  periodDebit: 0,
  periodCredit: 0,
  endBalance: g.balance
}));

// ─── BALANCE SHEET STRUCTURE ──────────────────────────────────────────────────
export const BALANCE_SHEET = {
  date: 'As of 11/01/2026',
  assets: {
    noncurrent: {
      label: 'Non-current assets',
      total: -15000,
      items: [
        { name: 'Property, plant and equipment and Investment Property', balance: 0 },
        { name: 'Goodwill', balance: 0 },
        { name: 'Advances for Capital Assets', balance: 0 },
        { name: 'Intangible assets', balance: 0 },
        { name: 'Investments', balance: -15000, expandable: true, children: [
          { name: 'Investments in associate', balance: 0 },
          { name: 'Available for sale investments', balance: 0 },
          { name: 'Receivables and other non-current assets', balance: 0 },
          { name: 'Deferred tax assets', balance: 0 },
        ]},
      ]
    },
    current: {
      label: 'Current Assets',
      total: 97944500,
      items: [
        { name: 'Cash and Cash Equivalents', balance: 10300200 },
        { name: 'Outstanding Receipts', balance: 53207200 },
        { name: 'Accounts Receivable', balance: 34437100 },
        { name: 'Prepayments and other current assets', balance: 0 },
        { name: 'Inventory', balance: 0 },
      ]
    }
  },
  liabilities: {
    noncurrent: {
      label: 'Non-Current Liabilities',
      total: 0,
      items: [
        { name: 'Employee benefits liabilities', balance: 0 },
        { name: 'Provisions', balance: 0 },
        { name: 'Deferred tax liabilities', balance: 0 },
      ]
    },
    current: {
      label: 'Current Liabilities',
      total: -3620500,
      items: [
        { name: 'Banks overdrafts and short-term borrowings', balance: 0 },
        { name: 'Interest-bearing loans and short term borrowings', balance: 0 },
        { name: 'Trade payables', balance: -10600000, expandable: true },
        { name: 'Provisions', balance: 0 },
        { name: 'Income tax liabilities', balance: 0 },
        { name: 'Other liabilities', balance: 6979500, expandable: true },
      ]
    }
  },
  equity: {
    total: 94309000,
    items: [
      { name: 'Share Capital', balance: 94309000 },
      { name: 'Retained Earnings', balance: 0 },
    ]
  }
};

// ─── PROFIT & LOSS ────────────────────────────────────────────────────────────
export const PROFIT_LOSS = {
  period: 'Nov 2026',
  income: [
    { name: 'Food & Beverage Revenue', amount: 7985000 },
    { name: 'Identity Cards Income', amount: 460000 },
    { name: 'Miscellaneous Income', amount: 5880000 },
    { name: 'Application fee', amount: 25000 },
    { name: 'Administrative cost', amount: 1400000 },
    { name: 'Special Faculty', amount: 600000 },
    { name: 'MUMSO fee', amount: 75000 },
  ],
  cogs: [
    { name: 'Cost of Goods Sold', amount: 845000 },
  ],
  expenses: [
    { name: 'Salaries and Wages Expense', amount: 5186000 },
    { name: 'Employer NSSF Expense', amount: 518600 },
    { name: 'SDL Expense', amount: 28000 },
    { name: 'WCF Expense', amount: 4000 },
    { name: 'Water Expenses', amount: 1000000 },
    { name: 'Electricity Expenses', amount: 1500000 },
    { name: 'TCU Annual subscription', amount: 1340000 },
  ],
};

// ─── CASH FLOW ────────────────────────────────────────────────────────────────
export const CASH_FLOW = {
  period: 'Nov 2026',
  operating: [
    { name: 'Net Profit / (Loss)', amount: -1461600 },
    { name: 'Adjustment for Non-Cash Items', amount: 0 },
    { name: 'Changes in Working Capital', amount: 0 },
    { name: 'Accounts Receivable (Increase)', amount: -34437100 },
    { name: 'Accounts Payable (Increase)', amount: 10600000 },
    { name: 'Tax Payments', amount: -432000 },
  ],
  investing: [
    { name: 'Purchase of Equipment', amount: 0 },
    { name: 'Investment Activities', amount: -15000 },
  ],
  financing: [
    { name: 'Share Capital Contribution', amount: 94309000 },
    { name: 'Loan Repayments', amount: 0 },
  ]
};

// ─── TAX REPORT ──────────────────────────────────────────────────────────────
export const TAX_REPORT = [
  { name: 'Sales (Taxable @ 18%)', base: 7985000, tax: 1437300, code: 'VAT_OUT' },
  { name: 'Sales (Zero-rated)', base: 120000, tax: 0, code: 'VAT_ZERO' },
  { name: 'Purchases (Taxable)', base: 845000, tax: 0, code: 'VAT_IN' },
  { name: 'VAT Payable (Net)', base: 0, tax: 1437300, code: 'VAT_NET' },
  { name: 'PAYE (Employee Tax)', base: 5186000, tax: 14400, code: 'PAYE' },
  { name: 'NSSF (10% Employer)', base: 5186000, tax: 518600, code: 'NSSF_EMP' },
  { name: 'SDL (4% of Gross)', base: 700000, tax: 28000, code: 'SDL' },
  { name: 'WCF (0.5% Capped)', base: 800000, tax: 4000, code: 'WCF' },
];

// ─── PARTNER LEDGER ──────────────────────────────────────────────────────────
export const PARTNER_LEDGER = [
  {
    partner: 'Marriott Hotel Dar', type: 'customer',
    lines: [
      { date: ds(30), ref: 'INV/2026/0001', debit: 2832000, credit: 0, balance: 2832000 },
      { date: ds(25), ref: 'PAY-002 Partial', debit: 0, credit: 2232000, balance: 600000 },
    ],
    total_debit: 2832000, total_credit: 2232000, balance: 600000
  },
  {
    partner: 'Serengeti Meats & Poultry', type: 'vendor',
    lines: [
      { date: ds(6), ref: 'BILL/2026/0001', debit: 0, credit: 422500, balance: -422500 },
      { date: ds(6), ref: 'PAY-003 Settlement', debit: 422500, credit: 0, balance: 0 },
    ],
    total_debit: 422500, total_credit: 422500, balance: 0
  },
  {
    partner: 'Farm Fresh Tanzania Ltd', type: 'vendor',
    lines: [
      { date: ds(1), ref: 'BILL/2026/0002', debit: 0, credit: 225000, balance: -225000 },
    ],
    total_debit: 0, total_credit: 225000, balance: -225000
  },
];

// ─── AGED RECEIVABLE ─────────────────────────────────────────────────────────
export const AGED_RECEIVABLE = [
  { partner: 'Marriott Hotel Dar', total: 600000, current: 0, days_1_30: 0, days_31_60: 600000, days_61_90: 0, older: 0 },
  { partner: 'Nelson Mandela Event Co.', total: 500000, current: 0, days_1_30: 300000, days_31_60: 200000, days_61_90: 0, older: 0 },
  { partner: 'Juma Rashid', total: 45000, current: 45000, days_1_30: 0, days_31_60: 0, days_61_90: 0, older: 0 },
  { partner: 'Fatima Enterprises', total: 175000, current: 0, days_1_30: 175000, days_31_60: 0, days_61_90: 0, older: 0 },
];

// ─── AGED PAYABLE ─────────────────────────────────────────────────────────────
export const AGED_PAYABLE = [
  { partner: 'Farm Fresh Tanzania Ltd', total: 225000, current: 225000, days_1_30: 0, days_31_60: 0, days_61_90: 0, older: 0 },
  { partner: 'Kibo Food & Beverage Supplies', total: 176000, current: 176000, days_1_30: 0, days_31_60: 0, days_61_90: 0, older: 0 },
];

export const ACC_SEED = {
  customers: CUSTOMERS,
  vendors: VENDORS,
  invoices: INVOICES,
  bills: BILLS,
  journalEntries: JOURNAL_ENTRIES,
  payments: PAYMENTS,
  bankAccounts: BANK_ACCOUNTS,
  chartOfAccounts: CHART_OF_ACCOUNTS,
};
