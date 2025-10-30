import type { Transaction, Budget, RecurringTransaction, SavingsGoal, StudentLoan, NotificationSettings } from '../types';

const NOTIFICATION_COOLDOWN_KEY = 'sentNotifications';

// Helper to check if a notification has been sent this session
const hasBeenSent = (notificationId: string): boolean => {
  try {
    const sent = JSON.parse(sessionStorage.getItem(NOTIFICATION_COOLDOWN_KEY) || '{}');
    return !!sent[notificationId];
  } catch {
    return false;
  }
};

// Helper to mark a notification as sent for this session
const markAsSent = (notificationId: string) => {
  try {
    const sent = JSON.parse(sessionStorage.getItem(NOTIFICATION_COOLDOWN_KEY) || '{}');
    sent[notificationId] = true;
    sessionStorage.setItem(NOTIFICATION_COOLDOWN_KEY, JSON.stringify(sent));
  } catch (error) {
    console.error("Could not write to sessionStorage:", error);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notifications.');
    return;
  }
  await Notification.requestPermission();
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    // FIX: The 'renotify' property is not a standard part of NotificationOptions.
    // The 'tag' property is already used correctly to prevent duplicate notifications by replacing old ones.
    new Notification(title, { ...options, icon: '/icon-192x192.png', tag: options?.body });
  }
};

interface CheckAllNotificationsArgs {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
  loans: StudentLoan[];
  settings: NotificationSettings;
}

const checkBudgetAlerts = (transactions: Transaction[], budgets: Budget[]) => {
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });
  
  budgets.forEach(budget => {
    const spent = expensesByCategory[budget.category] || 0;
    const percentage = (spent / budget.limit) * 100;
    const overBudgetAmount = spent - budget.limit;

    if (percentage >= 100) {
      const id = `budget-over-${budget.category}`;
      if (!hasBeenSent(id)) {
        showNotification('Budget Alert', { body: `You've gone over your KSH ${budget.limit} budget for ${budget.category} by KSH ${overBudgetAmount.toFixed(2)}!` });
        markAsSent(id);
      }
    } else if (percentage >= 85) {
       const id = `budget-warning-${budget.category}`;
       if (!hasBeenSent(id)) {
        showNotification('Budget Warning', { body: `You've spent ${percentage.toFixed(0)}% of your budget for ${budget.category}.` });
        markAsSent(id);
       }
    }
  });
};

const checkBillReminders = (recurringTransactions: RecurringTransaction[]) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(today.getDate() + 2);

  recurringTransactions.forEach(rt => {
    const dueDate = new Date(rt.nextDueDate);
    dueDate.setHours(0,0,0,0);
    if (dueDate <= twoDaysFromNow && dueDate >= today) {
       const id = `bill-reminder-${rt.id}-${rt.nextDueDate}`;
       if (!hasBeenSent(id)) {
         showNotification('Upcoming Bill', { body: `${rt.description} of KSH ${rt.amount} is due on ${dueDate.toLocaleDateString()}.` });
         markAsSent(id);
       }
    }
  });
};

const checkSavingsReminders = (savingsGoals: SavingsGoal[]) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    savingsGoals.forEach(goal => {
        const deadline = new Date(goal.deadline);
        deadline.setHours(0,0,0,0);
        if (deadline <= oneWeekFromNow && deadline >= today && goal.currentAmount < goal.targetAmount) {
            const id = `savings-reminder-${goal.id}`;
            if(!hasBeenSent(id)) {
                showNotification('Savings Goal Deadline', { body: `Your deadline for "${goal.name}" is approaching on ${deadline.toLocaleDateString()}!` });
                markAsSent(id);
            }
        }
    });
};

const checkLoanReminders = (loans: StudentLoan[]) => {
    const today = new Date();
    const currentDayOfMonth = today.getDate();

    loans.forEach(loan => {
        // Remind 3 days before due date
        const reminderDay = loan.paymentDueDate - 3; 
        if(currentDayOfMonth === reminderDay || currentDayOfMonth === loan.paymentDueDate) {
             const id = `loan-reminder-${loan.id}-${today.toISOString().split('T')[0]}`;
             if (!hasBeenSent(id)) {
                 showNotification('Loan Payment Due', { body: `Your payment for ${loan.lender} is due on day ${loan.paymentDueDate} of this month.` });
                 markAsSent(id);
             }
        }
    });
};

export const checkAllNotifications = (args: CheckAllNotificationsArgs) => {
  const { transactions, budgets, recurringTransactions, savingsGoals, loans, settings } = args;

  if (settings.budgetAlerts) {
    checkBudgetAlerts(transactions, budgets);
  }
  if (settings.billReminders) {
    checkBillReminders(recurringTransactions);
  }
  if (settings.savingsReminders) {
    checkSavingsReminders(savingsGoals);
  }
  if (settings.loanReminders) {
    checkLoanReminders(loans);
  }
};