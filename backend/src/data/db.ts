export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Plain mock for prototype
  role: 'EMPLOYEE' | 'HR_MANAGER' | 'ADMIN';
  designation: string;
  department: string;
  monthlySalary: number; // INR monthly salary for the demo workspace
  hourlyRate: number;
  availableWageLimitRatio: number; // e.g. 0.50 (can withdraw up to 50% accrued)
  bankAccount: {
    bankName: string;
    accountMasked: string;
    routingNumber: string;
  };
  avatarUrl: string;
}

export interface EwaTransaction {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  disbursedAt: string;
  transferType: 'INSTANT_UPI' | 'SAME_DAY_PAYPULSE';
  destinationAccount: string;
  note: string;
}

export interface ExpenseClaim {
  id: string;
  userId: string;
  employeeName: string;
  title: string;
  category: 'EDUCATION_EDTECH' | 'TRAVEL' | 'MEALS_ENTERTAINMENT' | 'HARDWARE_OFFICE' | 'HEALTH_WELLNESS';
  amount: number;
  currency: string;
  merchant: string;
  date: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  approvalNotes?: string;
  submittedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PAYROLL' | 'EWA_ADVANCE' | 'EXPENSE_UPDATE' | 'SYSTEM_ALERT';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface Payslip {
  id: string;
  userId: string;
  month: string; // "October 2026"
  payPeriod: string;
  grossPay: number;
  earnedWageWithdrawn: number;
  taxDeduction: number;
  insuranceDeduction: number;
  providentFund: number;
  netPay: number;
  payoutDate: string;
  status: 'PROCESSED' | 'PENDING';
}

// Initial Mock Database State
export const database = {
  users: [
    {
      id: 'usr_heftin_001',
      name: 'Alex Rivera',
      email: 'employee@heftin.ai',
      password: 'password123',
      role: 'EMPLOYEE' as const,
      designation: 'Senior Mobile Software Engineer',
      department: 'Engineering (FinTech & HR Innovation)',
      monthlySalary: 120000,
      hourlyRate: 750,
      availableWageLimitRatio: 0.5,
      bankAccount: {
        bankName: 'HDFC Bank',
        accountMasked: '•••• •••• •••• 4829',
        routingNumber: 'HDFC0004829',
      },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr_heftin_002',
      name: 'Sarah Chen',
      email: 'manager@heftin.ai',
      password: 'password123',
      role: 'HR_MANAGER' as const,
      designation: 'VP of People & Culture',
      department: 'Human Resources & Operations',
      monthlySalary: 180000,
      hourlyRate: 1125,
      availableWageLimitRatio: 0.5,
      bankAccount: {
        bankName: 'ICICI Bank',
        accountMasked: '•••• •••• •••• 9012',
        routingNumber: 'ICIC0009012',
      },
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
  ] as User[],

  ewaTransactions: [
    {
      id: 'tx_ewa_981',
      userId: 'usr_heftin_001',
      amount: 4000.0,
      fee: 0.0,
      status: 'COMPLETED' as const,
      disbursedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      transferType: 'INSTANT_UPI' as const,
      destinationAccount: '•••• 4829',
      note: 'Mid-month grocery & energy utility buffer',
    },
    {
      id: 'tx_ewa_982',
      userId: 'usr_heftin_001',
      amount: 2500.0,
      fee: 0.0,
      status: 'COMPLETED' as const,
      disbursedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      transferType: 'SAME_DAY_PAYPULSE' as const,
      destinationAccount: '•••• 4829',
      note: 'Emergency dental consultation co-pay',
    },
  ] as EwaTransaction[],

  expenseClaims: [
    {
      id: 'exp_771',
      userId: 'usr_heftin_001',
      employeeName: 'Alex Rivera',
      title: 'Advanced React Native Architecture & Fastlane Certification',
      category: 'EDUCATION_EDTECH' as const,
      amount: 8999,
      currency: 'INR',
      merchant: 'Frontend Masters · Meta Certification',
      date: '2026-11-04',
      receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4901f46487?w=400&auto=format&fit=crop&q=80',
      status: 'APPROVED' as const,
      approvalNotes: 'Approved under annual EdTech continuous learning stipend budget.',
      submittedAt: '2026-11-04T10:14:00Z',
    },
    {
      id: 'exp_772',
      userId: 'usr_heftin_001',
      employeeName: 'Alex Rivera',
      title: 'Client Onsite Travel: Off-peak Train Tickets',
      category: 'TRAVEL' as const,
      amount: 2450,
      currency: 'INR',
      merchant: 'Indian Railways · Vande Bharat',
      date: '2026-11-08',
      receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4901f46487?w=400&auto=format&fit=crop&q=80',
      status: 'PENDING' as const,
      approvalNotes: undefined,
      submittedAt: '2026-11-08T15:30:00Z',
    },
    {
      id: 'exp_773',
      userId: 'usr_heftin_001',
      employeeName: 'Alex Rivera',
      title: 'Ergonomic Mechanical Keyboard (Keychron K8 Pro)',
      category: 'HARDWARE_OFFICE' as const,
      amount: 6499,
      currency: 'INR',
      merchant: 'Keychron India Store',
      date: '2026-11-10',
      receiptUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
      status: 'PENDING' as const,
      approvalNotes: undefined,
      submittedAt: '2026-11-10T09:20:00Z',
    },
  ] as ExpenseClaim[],

  notifications: [
    {
      id: 'notif_001',
      userId: 'usr_heftin_001',
      title: 'Salary Advance Disbursed',
      message: '₹4,000.00 was added to your HDFC Bank demo ledger ending in 4829.',
      type: 'EWA_ADVANCE' as const,
      read: true,
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'notif_002',
      userId: 'usr_heftin_001',
      title: 'EdTech Claim Approved 🎉',
      message: 'Your claim for "₹8,999.00 - React Native Architecture" was approved by Sarah Chen.',
      type: 'EXPENSE_UPDATE' as const,
      read: false,
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'notif_003',
      userId: 'usr_heftin_001',
      title: 'PayPulse 2.6.0 is ready',
      message: 'New light workspace, INR payroll summaries, payday outlook, and claim search are available.',
      type: 'SYSTEM_ALERT' as const,
      read: false,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ] as AppNotification[],

  payslips: [
    {
      id: 'ps_2026_10',
      userId: 'usr_heftin_001',
      month: 'October 2026',
      payPeriod: 'Oct 01, 2026 - Oct 31, 2026',
      grossPay: 120000,
      earnedWageWithdrawn: 6500,
      taxDeduction: 12000,
      insuranceDeduction: 2500,
      providentFund: 14400,
      netPay: 84600, // gross - tax - ins - pf - ewa
      payoutDate: '2026-10-31',
      status: 'PROCESSED' as const,
    },
    {
      id: 'ps_2026_09',
      userId: 'usr_heftin_001',
      month: 'September 2026',
      payPeriod: 'Sep 01, 2026 - Sep 30, 2026',
      grossPay: 120000,
      earnedWageWithdrawn: 4000,
      taxDeduction: 12000,
      insuranceDeduction: 2500,
      providentFund: 14400,
      netPay: 87100,
      payoutDate: '2026-09-30',
      status: 'PROCESSED' as const,
    },
  ] as Payslip[],
};

