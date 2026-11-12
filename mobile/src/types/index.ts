export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'HR_MANAGER' | 'ADMIN';
  designation: string;
  department: string;
  monthlySalary: number;
  availableWageLimitRatio: number;
  bankAccount: {
    bankName: string;
    accountMasked: string;
    routingNumber: string;
  };
  avatarUrl: string;
}

export interface EwaSummary {
  userId: string;
  monthlySalary: number;
  dailyEarnings: number;
  currentDayOfMonth: number;
  daysInMonth: number;
  grossAccruedToDate: number;
  maxEligibleAccrual: number;
  withdrawnToDate: number;
  availableToWithdraw: number;
  limitRatioPercentage: number;
  bankAccount: {
    bankName: string;
    accountMasked: string;
    routingNumber: string;
  };
  transactions: EwaTransaction[];
}

export interface EwaTransaction {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  disbursedAt: string;
  transferType: 'INSTANT_ACH' | 'SAME_DAY_PAYPULSE';
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
}

export interface Payslip {
  id: string;
  userId: string;
  month: string;
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

export interface ReleaseInfo {
  latestVersion: string;
  buildNumber: number;
  minimumRequiredVersion: string;
  forceUpdate: boolean;
  updateRecommended: boolean;
  releaseDate: string;
  whatsNew: string[];
  storeUrl: string;
  environment: string;
}

