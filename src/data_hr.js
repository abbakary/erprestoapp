// RestoERP HR Module — Demo Data
// Employees, Contracts, Payroll, Expenses, Attendance
// Follows Odoo HR + Payroll structure (zalongwa_om_hr_payroll reference)

const now = Date.now();
const ds = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: 'dept_1', name: 'Management', manager: 'David Kimani', headcount: 2 },
  { id: 'dept_2', name: 'Kitchen & Production', manager: 'Chef Baraka', headcount: 4 },
  { id: 'dept_3', name: 'Front of House', manager: 'Rehema Said', headcount: 5 },
  { id: 'dept_4', name: 'Finance & Accounting', manager: 'Zawadi Ally', headcount: 2 },
  { id: 'dept_5', name: 'Stores & Procurement', manager: 'Hamisi Bakari', headcount: 2 },
];

// ─── JOB POSITIONS ────────────────────────────────────────────────────────────
export const JOB_POSITIONS = [
  { id: 'job_1', name: 'Group CEO & Owner', dept: 'dept_1' },
  { id: 'job_2', name: 'General Manager', dept: 'dept_1' },
  { id: 'job_3', name: 'Head Chef', dept: 'dept_2' },
  { id: 'job_4', name: 'Production Manager', dept: 'dept_2' },
  { id: 'job_5', name: 'Line Cook', dept: 'dept_2' },
  { id: 'job_6', name: 'Pastry Chef', dept: 'dept_2' },
  { id: 'job_7', name: 'Senior Waiter', dept: 'dept_3' },
  { id: 'job_8', name: 'Floor Waiter', dept: 'dept_3' },
  { id: 'job_9', name: 'Cashier', dept: 'dept_3' },
  { id: 'job_10', name: 'Head Cashier', dept: 'dept_4' },
  { id: 'job_11', name: 'Accounts Assistant', dept: 'dept_4' },
  { id: 'job_12', name: 'Storekeeper', dept: 'dept_5' },
  { id: 'job_13', name: 'Procurement Officer', dept: 'dept_5' },
];

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
export const EMPLOYEES = [
  {
    id: 'emp_1', name: 'David Kimani', empNo: 'EMP-001', jobId: 'job_1', deptId: 'dept_1',
    phone: '+255 718 000 777', email: 'david.k@safariholding.tz', gender: 'Male',
    dob: '1978-04-15', nationality: 'Kenyan', nida: 'KE-78-001234',
    joinDate: '2019-01-01', contractType: 'Permanent', status: 'active',
    avatar: 'DK', wage: 2500000, hra: 500000, travel: 200000, meal: 100000,
    bank: 'CRDB', accountNo: '01501000001', tin: 'TZ-TIN-00001',
    nssf: 'NSSF-00001', site: 'Masaki HQ', manager: null, photo_url: null
  },
  {
    id: 'emp_2', name: 'Rehema Said', empNo: 'EMP-002', jobId: 'job_2', deptId: 'dept_1',
    phone: '+255 715 000 444', email: 'rehema.s@safarigrill.tz', gender: 'Female',
    dob: '1985-09-22', nationality: 'Tanzanian', nida: 'TZ-85-009222',
    joinDate: '2019-03-01', contractType: 'Permanent', status: 'active',
    avatar: 'RS', wage: 1800000, hra: 360000, travel: 150000, meal: 80000,
    bank: 'NMB', accountNo: '40310100002', tin: 'TZ-TIN-00002',
    nssf: 'NSSF-00002', site: 'Masaki', manager: 'emp_1', photo_url: null
  },
  {
    id: 'emp_3', name: 'Chef Baraka Mwalimu', empNo: 'EMP-003', jobId: 'job_3', deptId: 'dept_2',
    phone: '+255 716 000 555', email: 'baraka@safarigrill.tz', gender: 'Male',
    dob: '1988-11-05', nationality: 'Tanzanian', nida: 'TZ-88-011505',
    joinDate: '2019-06-01', contractType: 'Permanent', status: 'active',
    avatar: 'CB', wage: 1400000, hra: 280000, travel: 100000, meal: 60000,
    bank: 'CRDB', accountNo: '01501000003', tin: 'TZ-TIN-00003',
    nssf: 'NSSF-00003', site: 'Masaki', manager: 'emp_2', photo_url: null
  },
  {
    id: 'emp_4', name: 'Jaffar Mdee', empNo: 'EMP-004', jobId: 'job_4', deptId: 'dept_2',
    phone: '+255 719 000 888', email: 'jaffar.m@safarigrill.tz', gender: 'Male',
    dob: '1990-02-14', nationality: 'Tanzanian', nida: 'TZ-90-002144',
    joinDate: '2020-01-15', contractType: 'Permanent', status: 'active',
    avatar: 'JM', wage: 1200000, hra: 240000, travel: 100000, meal: 60000,
    bank: 'NMB', accountNo: '40310100004', tin: 'TZ-TIN-00004',
    nssf: 'NSSF-00004', site: 'Masaki', manager: 'emp_3', photo_url: null
  },
  {
    id: 'emp_5', name: 'Amani Juma', empNo: 'EMP-005', jobId: 'job_7', deptId: 'dept_3',
    phone: '+255 713 000 222', email: 'amani.j@safarigrill.tz', gender: 'Male',
    dob: '1995-07-08', nationality: 'Tanzanian', nida: 'TZ-95-007088',
    joinDate: '2021-04-01', contractType: 'Permanent', status: 'active',
    avatar: 'AJ', wage: 650000, hra: 130000, travel: 50000, meal: 30000,
    bank: 'CRDB', accountNo: '01501000005', tin: 'TZ-TIN-00005',
    nssf: 'NSSF-00005', site: 'Masaki', manager: 'emp_2', photo_url: null
  },
  {
    id: 'emp_6', name: 'Neema Mushi', empNo: 'EMP-006', jobId: 'job_8', deptId: 'dept_3',
    phone: '+255 713 000 223', email: 'neema.m@safarigrill.tz', gender: 'Female',
    dob: '1997-03-20', nationality: 'Tanzanian', nida: 'TZ-97-003200',
    joinDate: '2021-08-01', contractType: 'Permanent', status: 'active',
    avatar: 'NM', wage: 550000, hra: 110000, travel: 40000, meal: 25000,
    bank: 'NMB', accountNo: '40310100006', tin: 'TZ-TIN-00006',
    nssf: 'NSSF-00006', site: 'Masaki', manager: 'emp_2', photo_url: null
  },
  {
    id: 'emp_7', name: 'Zawadi Ally', empNo: 'EMP-007', jobId: 'job_10', deptId: 'dept_4',
    phone: '+255 714 000 333', email: 'zawadi.a@safarigrill.tz', gender: 'Female',
    dob: '1992-06-11', nationality: 'Tanzanian', nida: 'TZ-92-006110',
    joinDate: '2019-07-01', contractType: 'Permanent', status: 'active',
    avatar: 'ZA', wage: 900000, hra: 180000, travel: 70000, meal: 40000,
    bank: 'CRDB', accountNo: '01501000007', tin: 'TZ-TIN-00007',
    nssf: 'NSSF-00007', site: 'Masaki', manager: 'emp_2', photo_url: null
  },
  {
    id: 'emp_8', name: 'Hamisi Bakari', empNo: 'EMP-008', jobId: 'job_12', deptId: 'dept_5',
    phone: '+255 717 000 666', email: 'hamisi.b@safarigrill.tz', gender: 'Male',
    dob: '1991-12-30', nationality: 'Tanzanian', nida: 'TZ-91-012300',
    joinDate: '2020-03-01', contractType: 'Permanent', status: 'active',
    avatar: 'HB', wage: 750000, hra: 150000, travel: 60000, meal: 35000,
    bank: 'NMB', accountNo: '40310100008', tin: 'TZ-TIN-00008',
    nssf: 'NSSF-00008', site: 'Masaki', manager: 'emp_2', photo_url: null
  },
  {
    id: 'emp_9', name: 'Zainab Hassan', empNo: 'EMP-009', jobId: 'job_5', deptId: 'dept_2',
    phone: '+255 712 445 221', email: 'zainab.h@safarigrill.tz', gender: 'Female',
    dob: '1993-05-17', nationality: 'Tanzanian', nida: 'TZ-93-005170',
    joinDate: '2022-01-15', contractType: 'Permanent', status: 'active',
    avatar: 'ZH', wage: 800000, hra: 160000, travel: 60000, meal: 35000,
    bank: 'CRDB', accountNo: '01501000009', tin: 'TZ-TIN-00009',
    nssf: 'NSSF-00009', site: 'Masaki', manager: 'emp_3', photo_url: null
  },
  {
    id: 'emp_10', name: 'Oscar Temba', empNo: 'EMP-010', jobId: 'job_6', deptId: 'dept_2',
    phone: '+255 754 231 009', email: 'oscar.t@safarigrill.tz', gender: 'Male',
    dob: '1996-08-29', nationality: 'Tanzanian', nida: 'TZ-96-008290',
    joinDate: '2022-06-01', contractType: 'Fixed Term', status: 'active',
    avatar: 'OT', wage: 720000, hra: 144000, travel: 50000, meal: 30000,
    bank: 'NMB', accountNo: '40310100010', tin: 'TZ-TIN-00010',
    nssf: 'NSSF-00010', site: 'Masaki', manager: 'emp_3', photo_url: null
  },
];

// ─── SALARY STRUCTURE RULES (Tanzania Payroll Standard) ──────────────────────
// Based on zalongwa_om_hr_payroll reference
export const SALARY_RULES = [
  // EARNINGS
  { code: 'BASIC', name: 'Basic Salary', category: 'BASIC', sequence: 1, type: 'earning' },
  { code: 'HRA', name: 'House Rent Allowance', category: 'ALW', sequence: 2, type: 'earning' },
  { code: 'TRAVEL', name: 'Travel Allowance', category: 'ALW', sequence: 3, type: 'earning' },
  { code: 'MEAL', name: 'Meal Allowance', category: 'ALW', sequence: 4, type: 'earning' },
  { code: 'MEDICAL', name: 'Medical Allowance', category: 'ALW', sequence: 5, type: 'earning' },
  { code: 'GROSS', name: 'Gross Salary', category: 'GROSS', sequence: 10, type: 'earning' },
  // DEDUCTIONS
  { code: 'NSSF_EE', name: 'NSSF Employee (10%)', category: 'DED', sequence: 20, type: 'deduction' },
  { code: 'PAYE', name: 'PAYE Tax', category: 'DED', sequence: 25, type: 'deduction' },
  { code: 'NET', name: 'Net Salary', category: 'NET', sequence: 100, type: 'net' },
  // EMPLOYER CONTRIBUTIONS
  { code: 'NSSF_ER', name: 'Employer NSSF (10%)', category: 'EMP_CONT', sequence: 30, type: 'employer' },
  { code: 'SDL', name: 'SDL (4% of Gross)', category: 'EMP_CONT', sequence: 31, type: 'employer' },
  { code: 'WCF', name: 'WCF (0.5% capped)', category: 'EMP_CONT', sequence: 32, type: 'employer' },
];

// Compute PAYE for Tanzania (TRA 2025/2026 Tax Table)
export function computePAYE(monthlyIncome) {
  const annual = monthlyIncome * 12;
  let tax = 0;
  if (annual <= 3240000) {
    tax = 0;
  } else if (annual <= 6240000) {
    tax = (annual - 3240000) * 0.08;
  } else if (annual <= 9240000) {
    tax = 240000 + (annual - 6240000) * 0.20;
  } else if (annual <= 12240000) {
    tax = 840000 + (annual - 9240000) * 0.25;
  } else {
    tax = 1590000 + (annual - 12240000) * 0.30;
  }
  return Math.round(tax / 12);
}

// Compute payslip lines from employee record
export function computePayslip(emp) {
  const basic = emp.wage || 0;
  const hra = emp.hra || 0;
  const travel = emp.travel || 0;
  const meal = emp.meal || 0;
  const medical = emp.medical || 0;
  const gross = basic + hra + travel + meal + medical;

  const nssf_ee = Math.round(basic * 0.10); // 10% of basic
  const paye = computePAYE(gross);
  const net = gross - nssf_ee - paye;

  // Employer contributions
  const nssf_er = Math.round(basic * 0.10);
  const sdl = Math.round(gross * 0.04);
  const wcf = Math.min(Math.round(gross * 0.005), 10 * gross / 100);

  return {
    basic, hra, travel, meal, medical, gross,
    nssf_ee, paye, net,
    nssf_er, sdl, wcf,
    totalCostToCompany: gross + nssf_er + sdl + wcf
  };
}

// ─── PAYSLIPS ─────────────────────────────────────────────────────────────────
function makePayslip(emp, period, state = 'done') {
  const calc = computePayslip(emp);
  const [year, month] = period.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en', { month: 'long' });
  return {
    id: `slip_${emp.id}_${period}`,
    no: `SLIP/${year}/${emp.empNo.replace('EMP-', '')}/${month}`,
    name: `Salary Slip of ${emp.name} for ${monthName}-${year}`,
    employeeId: emp.id,
    employeeName: emp.name,
    deptId: emp.deptId,
    period,
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-30`,
    state,
    lines: [
      { code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: calc.basic, type: 'earning' },
      { code: 'HRA', name: 'House Rent Allowance', category: 'ALW', amount: calc.hra, type: 'earning' },
      { code: 'TRAVEL', name: 'Travel Allowance', category: 'ALW', amount: calc.travel, type: 'earning' },
      { code: 'MEAL', name: 'Meal Allowance', category: 'ALW', amount: calc.meal, type: 'earning' },
      { code: 'GROSS', name: 'Gross Salary', category: 'GROSS', amount: calc.gross, type: 'earning' },
      { code: 'NSSF_EE', name: 'NSSF Employee (10%)', category: 'DED', amount: calc.nssf_ee, type: 'deduction' },
      { code: 'PAYE', name: 'PAYE Tax', category: 'DED', amount: calc.paye, type: 'deduction' },
      { code: 'NET', name: 'Net Salary', category: 'NET', amount: calc.net, type: 'net' },
      { code: 'NSSF_ER', name: 'Employer NSSF (10%)', category: 'EMP_CONT', amount: calc.nssf_er, type: 'employer' },
      { code: 'SDL', name: 'SDL (4%)', category: 'EMP_CONT', amount: calc.sdl, type: 'employer' },
      { code: 'WCF', name: 'WCF', category: 'EMP_CONT', amount: calc.wcf, type: 'employer' },
    ],
    gross: calc.gross,
    net: calc.net,
    totalDeductions: calc.nssf_ee + calc.paye,
    totalEmployerCost: calc.totalCostToCompany,
    paymentDate: `${year}-${month}-28`,
    paymentMethod: 'bank',
    notes: ''
  };
}

// Generate payslips for Oct and Nov 2026
export const PAYSLIPS = [
  ...EMPLOYEES.map(e => makePayslip(e, '2026-10', 'done')),
  ...EMPLOYEES.map(e => makePayslip(e, '2026-11', 'done')),
];

// ─── PAYSLIP BATCHES ──────────────────────────────────────────────────────────
export const PAYSLIP_BATCHES = [
  {
    id: 'batch_oct26', name: 'October 2026 Payroll', dateStart: '2026-10-01', dateEnd: '2026-10-31',
    state: 'done', slipIds: EMPLOYEES.map(e => `slip_${e.id}_2026-10`),
    totalGross: EMPLOYEES.reduce((s, e) => s + computePayslip(e).gross, 0),
    totalNet: EMPLOYEES.reduce((s, e) => s + computePayslip(e).net, 0),
    employeeCount: EMPLOYEES.length
  },
  {
    id: 'batch_nov26', name: 'November 2026 Payroll', dateStart: '2026-11-01', dateEnd: '2026-11-30',
    state: 'done', slipIds: EMPLOYEES.map(e => `slip_${e.id}_2026-11`),
    totalGross: EMPLOYEES.reduce((s, e) => s + computePayslip(e).gross, 0),
    totalNet: EMPLOYEES.reduce((s, e) => s + computePayslip(e).net, 0),
    employeeCount: EMPLOYEES.length
  },
];

// ─── EMPLOYEE EXPENSES ────────────────────────────────────────────────────────
export const EMP_EXPENSES = [
  {
    id: 'exp_hr_1', date: ds(2), employeeId: 'emp_2', employeeName: 'Rehema Said',
    category: 'Travel & Transport', description: 'Taxi to supplier meeting — Kariakoo',
    amount: 25000, currency: 'TZS', state: 'approved', paymentMode: 'own_account',
    ref: 'EXP-2026-001', approvedBy: 'David Kimani', attachments: []
  },
  {
    id: 'exp_hr_2', date: ds(5), employeeId: 'emp_3', employeeName: 'Chef Baraka Mwalimu',
    category: 'Training & Development', description: 'Food Safety HACCP Certification Course',
    amount: 85000, currency: 'TZS', state: 'approved', paymentMode: 'company',
    ref: 'EXP-2026-002', approvedBy: 'Rehema Said', attachments: []
  },
  {
    id: 'exp_hr_3', date: ds(1), employeeId: 'emp_7', employeeName: 'Zawadi Ally',
    category: 'Office Supplies', description: 'Receipt rolls and POS paper — bulk',
    amount: 18500, currency: 'TZS', state: 'draft', paymentMode: 'own_account',
    ref: 'EXP-2026-003', approvedBy: null, attachments: []
  },
  {
    id: 'exp_hr_4', date: ds(8), employeeId: 'emp_8', employeeName: 'Hamisi Bakari',
    category: 'Vehicle & Fuel', description: 'Fuel for delivery van — Oysterbay restock',
    amount: 55000, currency: 'TZS', state: 'posted', paymentMode: 'company',
    ref: 'EXP-2026-004', approvedBy: 'Rehema Said', attachments: []
  },
  {
    id: 'exp_hr_5', date: ds(12), employeeId: 'emp_5', employeeName: 'Amani Juma',
    category: 'Uniform & Grooming', description: 'New service uniform purchase',
    amount: 42000, currency: 'TZS', state: 'approved', paymentMode: 'company',
    ref: 'EXP-2026-005', approvedBy: 'Rehema Said', attachments: []
  },
  {
    id: 'exp_hr_6', date: ds(15), employeeId: 'emp_4', employeeName: 'Jaffar Mdee',
    category: 'Kitchen Supplies', description: 'Piping bags and decorating tools',
    amount: 32000, currency: 'TZS', state: 'refused', paymentMode: 'own_account',
    ref: 'EXP-2026-006', approvedBy: null, attachments: []
  },
];

// ─── ATTENDANCE SUMMARY ──────────────────────────────────────────────────────
export const ATTENDANCE_SUMMARY = EMPLOYEES.map(emp => ({
  employeeId: emp.id,
  employeeName: emp.name,
  month: '2026-11',
  workedDays: 22 + Math.floor(Math.random() * 3),
  leaveDays: Math.floor(Math.random() * 3),
  absentDays: Math.floor(Math.random() * 2),
  overtimeHours: Math.floor(Math.random() * 8),
}));

// ─── LEAVE ALLOCATIONS ────────────────────────────────────────────────────────
export const LEAVES = [
  { id: 'lv_1', employeeId: 'emp_5', type: 'Annual Leave', days: 2, from: ds(-5), to: ds(-4), state: 'approved', approvedBy: 'Rehema Said' },
  { id: 'lv_2', employeeId: 'emp_6', type: 'Sick Leave', days: 1, from: ds(-2), to: ds(-2), state: 'approved', approvedBy: 'Rehema Said' },
  { id: 'lv_3', employeeId: 'emp_3', type: 'Annual Leave', days: 5, from: ds(10), to: ds(5), state: 'validated', approvedBy: 'David Kimani' },
];

export const HR_SEED = {
  employees: EMPLOYEES,
  departments: DEPARTMENTS,
  jobPositions: JOB_POSITIONS,
  payslips: PAYSLIPS,
  payslipBatches: PAYSLIP_BATCHES,
  empExpenses: EMP_EXPENSES,
  attendance: ATTENDANCE_SUMMARY,
  leaves: LEAVES,
};
