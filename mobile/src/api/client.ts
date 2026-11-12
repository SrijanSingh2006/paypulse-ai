import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, EwaSummary, ExpenseClaim, AppNotification, Payslip } from '../types';

// Detect if running on an external web host (e.g. Vercel HTTPS) where calling http://localhost is blocked as Mixed Content
export const isWebProduction =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

export const BASE_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@paypulse_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to read token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Mock In-Memory Store for Offline / Standalone Showcase
export const fallbackStore = {
  user: {
    id: 'usr_heftin_001',
    name: 'Alex Rivera',
    email: 'employee@heftin.ai',
    role: 'EMPLOYEE' as const,
    designation: 'Senior Mobile Software Engineer',
    department: 'Engineering (FinTech & HR Innovation)',
    monthlySalary: 7200,
    availableWageLimitRatio: 0.5,
    bankAccount: {
      bankName: 'Silicon Valley Bank / First Republic',
      accountMasked: '•••• •••• •••• 4829',
      routingNumber: '121000358',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  } as User,
  summary: {
    userId: 'usr_heftin_001',
    monthlySalary: 7200,
    dailyEarnings: 240,
    currentDayOfMonth: 12,
    daysInMonth: 30,
    grossAccruedToDate: 2880,
    maxEligibleAccrual: 1440,
    withdrawnToDate: 650,
    availableToWithdraw: 790,
    limitRatioPercentage: 50,
    bankAccount: {
      bankName: 'Silicon Valley Bank',
      accountMasked: '•••• 4829',
      routingNumber: '121000358',
    },
    transactions: [
      {
        id: 'tx_ewa_981',
        userId: 'usr_heftin_001',
        amount: 400.0,
        fee: 0.0,
        status: 'COMPLETED' as const,
        disbursedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        transferType: 'INSTANT_ACH' as const,
        destinationAccount: '•••• 4829',
        note: 'Mid-month grocery & utility buffer',
      },
      {
        id: 'tx_ewa_982',
        userId: 'usr_heftin_001',
        amount: 250.0,
        fee: 0.0,
        status: 'COMPLETED' as const,
        disbursedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        transferType: 'SAME_DAY_PAYPULSE' as const,
        destinationAccount: '•••• 4829',
        note: 'Emergency dental co-pay',
      },
    ],
  } as EwaSummary,
  claims: [
    {
      id: 'exp_771',
      userId: 'usr_heftin_001',
      employeeName: 'Alex Rivera',
      title: 'Advanced React Native Architecture & Fastlane Certification',
      category: 'EDUCATION_EDTECH' as const,
      amount: 349.0,
      currency: 'USD',
      merchant: 'Frontend Masters & Meta Certification',
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
      amount: 88.5,
      currency: 'USD',
      merchant: 'Amtrak Acela Regional',
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
      amount: 129.99,
      currency: 'USD',
      merchant: 'Keychron Official Store',
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
      title: 'Salary Advance Disbursed ⚡',
      message: '$400.00 was deposited into your checking account ending in 4829.',
      type: 'EWA_ADVANCE' as const,
      read: true,
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'notif_002',
      userId: 'usr_heftin_001',
      title: 'EdTech Claim Approved 🎉',
      message: 'Your claim for "$349.00 - React Native Architecture" was approved by Sarah Chen.',
      type: 'EXPENSE_UPDATE' as const,
      read: false,
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'notif_003',
      userId: 'usr_heftin_001',
      title: 'Heftin PayPulse 2.4.0 Live',
      message: 'New build released with biometric FaceID security and faster receipt upload.',
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
      grossPay: 7200.0,
      earnedWageWithdrawn: 650.0,
      taxDeduction: 1440.0,
      insuranceDeduction: 280.0,
      providentFund: 432.0,
      netPay: 4398.0,
      payoutDate: '2026-10-31',
      status: 'PROCESSED' as const,
    },
  ] as Payslip[],
};

