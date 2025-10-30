export type TransactionType = 'income' | 'expense';
export type Frequency = 'monthly' | 'weekly';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
}

export interface Budget {
  category: string;
  limit: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface StudentLoan {
    id: string;
    lender: string;
    initialAmount: number;
    currentBalance: number;
    interestRate: number;
    paymentDueDate: number; // Day of the month
    paymentHistory: { date: string; amount: number }[];
}

export interface RecurringTransaction {
    id: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    frequency: Frequency;
    startDate: string;
    nextDueDate: string;
    dayOfWeek?: number; // 0 for Sunday, 6 for Saturday
    dayOfMonth?: number; // 1-31
}

export interface NotificationSettings {
    budgetAlerts: boolean;
    billReminders: boolean;
    savingsReminders: boolean;
    loanReminders: boolean;
}
