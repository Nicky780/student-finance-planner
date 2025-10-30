import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';

import type { Transaction, SavingsGoal, Budget, StudentLoan, RecurringTransaction, NotificationSettings } from './types';
import { ICONS, EXPENSE_CATEGORIES } from './constants';

import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SavingsPage from './pages/SavingsPage';
import LoansPage from './pages/LoansPage';
import LearnPage from './pages/LearnPage';
import RecurringPage from './pages/RecurringPage';
import SettingsPage from './pages/SettingsPage';
import StatementPage from './pages/StatementPage';

import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import RecurringTransactionForm from './components/RecurringTransactionForm';
import RegisterForm from './components/RegisterForm';
import WelcomeModal from './components/WelcomeModal';
import TourGuide from './components/TourGuide';

import { checkAllNotifications } from './services/notificationService';

type Page = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'loans' | 'recurring' | 'learn' | 'settings' | 'statement';

function App() {
  const [user, setUser] = useLocalStorage<{ name: string } | null>('user', null);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [loans, setLoans] = useLocalStorage<StudentLoan[]>('loans', []);
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>('notificationSettings', {
    budgetAlerts: true, billReminders: true, savingsReminders: true, loanReminders: true
  });
  
  const [isFirstLogin, setIsFirstLogin] = useLocalStorage('isFirstLogin', true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isRecurringModalOpen, setRecurringModalOpen] = useState(false);
  
  const [statementDates, setStatementDates] = useState<{start: string, end: string} | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
   useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegister = (name: string) => {
    setUser({ name });
    setShowWelcome(true);
  };
  
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to change user?")) {
      setUser(null);
      // Optional: clear all data on logout
      // setTransactions([]); setSavingsGoals([]); setBudgets([]); setLoans([]); setRecurringTransactions([]);
    }
  };

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: new Date().getTime().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTransactionModalOpen(false);
  }, [setTransactions]);

  const addLoanPayment = useCallback((loanId: string, amount: number) => {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      const paymentTransaction: Omit<Transaction, 'id'> = {
          type: 'expense',
          amount: amount,
          category: 'Loan Payment',
          description: `Payment for ${loan.lender}`,
          date: new Date().toISOString(),
      };
      addTransaction(paymentTransaction);

      setLoans(prevLoans => prevLoans.map(l => 
          l.id === loanId ? { ...l, currentBalance: l.currentBalance - amount } : l
      ));
  }, [loans, addTransaction, setLoans]);

  const processRecurringTransactions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let hasChanged = false;

    const updatedRecurring = recurringTransactions.map(rt => {
      let nextDueDate = new Date(rt.nextDueDate);
      nextDueDate.setHours(0, 0, 0, 0);

      if (nextDueDate <= today) {
        hasChanged = true;
        addTransaction({
          type: rt.type,
          amount: rt.amount,
          category: rt.category,
          description: `(Recurring) ${rt.description}`,
          date: rt.nextDueDate,
        });
        
        const newDueDate = new Date(rt.nextDueDate);
        if (rt.frequency === 'monthly') {
          newDueDate.setMonth(newDueDate.getMonth() + 1);
        } else if (rt.frequency === 'weekly') {
          newDueDate.setDate(newDueDate.getDate() + 7);
        }
        return { ...rt, nextDueDate: newDueDate.toISOString() };
      }
      return rt;
    });

    if (hasChanged) {
      setRecurringTransactions(updatedRecurring);
    }
  }, [recurringTransactions, setRecurringTransactions, addTransaction]);

  useEffect(() => {
    if (user) {
      processRecurringTransactions();
    }
  }, [user, processRecurringTransactions]);
  
  useEffect(() => {
    if (user && transactions.length > 0) { // Only check notifications if there's data
      checkAllNotifications({
        transactions, budgets, recurringTransactions, savingsGoals, loans, settings: notificationSettings
      });
    }
  }, [user, transactions, budgets, recurringTransactions, savingsGoals, loans, notificationSettings]);

  const { balance, totalIncome, totalExpenses } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { balance: income - expenses, totalIncome: income, totalExpenses: expenses };
  }, [transactions]);
  
  const handleGenerateStatement = (start: string, end: string) => {
      setStatementDates({ start, end });
      setCurrentPage('statement');
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { id: 'transactions', label: 'Transactions', icon: ICONS.transactions },
    { id: 'budgets', label: 'Budgets', icon: ICONS.budgets },
    { id: 'savings', label: 'Savings', icon: ICONS.savings },
    { id: 'loans', label: 'Loans', icon: ICONS.loans },
    { id: 'recurring', label: 'Recurring', icon: ICONS.recurring },
    { id: 'learn', label: 'Learn', icon: ICONS.learn },
  ];

  const handleTourStepChange = (stepIndex: number, stepTarget: string) => {
    if (isMobile) {
      const isNavStep = stepTarget.startsWith('#nav-');
      if (isNavStep && !isMenuOpen) {
        setIsMenuOpen(true);
      } else if (!isNavStep && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  const NavContent = () => (
    <nav className="flex flex-col p-4 space-y-2">
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 px-4 mb-2">FinPal</h2>
      {navItems.map(({ id, label, icon }) => (
        <button
          key={id}
          data-tour-id={`nav-${id}`}
          onClick={() => { setCurrentPage(id as Page); setIsMenuOpen(false); }}
          className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
            currentPage === id 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="w-6 h-6">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Welcome to FinPal</h1>
          <p className="text-center text-gray-500 dark:text-gray-400">Your student finance companion.</p>
          <RegisterForm onRegister={handleRegister} />
        </div>
      </div>
    );
  }
  
  if (statementDates) {
      return <StatementPage 
        user={user} 
        transactions={transactions} 
        startDate={statementDates.start} 
        endDate={statementDates.end} 
        onBack={() => { setStatementDates(null); setCurrentPage('transactions'); }}
      />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage user={user} onLogout={handleLogout} transactions={transactions} savingsGoals={savingsGoals} balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} onNavigateToSettings={() => setCurrentPage('settings')} />;
      case 'transactions': return <TransactionsPage transactions={transactions} setTransactions={setTransactions} onGenerateStatement={handleGenerateStatement} />;
      case 'budgets': return <BudgetsPage transactions={transactions} budgets={budgets} setBudgets={setBudgets} />;
      case 'savings': return <SavingsPage savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals} />;
      case 'loans': return <LoansPage loans={loans} setLoans={setLoans} onAddPayment={addLoanPayment} />;
      case 'recurring': return <RecurringPage recurringTransactions={recurringTransactions} setRecurringTransactions={setRecurringTransactions} />;
      case 'learn': return <LearnPage />;
      case 'settings': return <SettingsPage settings={notificationSettings} setSettings={setNotificationSettings} onBack={() => setCurrentPage('dashboard')} />;
      default: return <DashboardPage user={user} onLogout={handleLogout} transactions={transactions} savingsGoals={savingsGoals} balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} onNavigateToSettings={() => setCurrentPage('settings')} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <WelcomeModal 
            isOpen={showWelcome} 
            onSkip={() => { setShowWelcome(false); setIsFirstLogin(false); }}
            onStartTour={() => { setShowWelcome(false); setRunTour(true); setIsFirstLogin(false); }}
        />
        <TourGuide run={runTour} onStepChange={handleTourStepChange} />

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <NavContent />
        </aside>

        {/* Mobile Menu */}
        {isMobile && (
            <>
                <div 
                    className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                    onClick={() => setIsMenuOpen(false)}
                ></div>
                <div 
                    className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 z-40 transform transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex justify-end p-2">
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           {ICONS.close}
                        </button>
                    </div>
                    <NavContent />
                </div>
            </>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
            {isMobile && (
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
                    <button data-tour-id="nav-menu" onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-500 dark:text-gray-400">
                        {ICONS.menu}
                    </button>
                     <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                    </h1>
                    <div className="w-10"></div>
                </header>
            )}
            <div className="flex-1 overflow-y-auto">
                {renderPage()}
            </div>
        </main>

        <div className="fixed bottom-4 right-4 z-10 flex flex-col space-y-2">
            <button
                onClick={() => setRecurringModalOpen(true)}
                className="bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700"
                title="Add Recurring Transaction"
                data-tour-id="add-recurring-button"
            >
              {ICONS.recurring}
            </button>
            <button
                onClick={() => setTransactionModalOpen(true)}
                className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700"
                title="Add Transaction"
                data-tour-id="add-transaction-button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>

        <Modal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} title="Add New Transaction">
            <TransactionForm onSave={addTransaction} onClose={() => setTransactionModalOpen(false)} />
        </Modal>

        <Modal isOpen={isRecurringModalOpen} onClose={() => setRecurringModalOpen(false)} title="Add Recurring Transaction">
            <RecurringTransactionForm 
                onSave={(data) => {
                    const newRecurring = { ...data, id: Date.now().toString(), nextDueDate: data.startDate };
                    setRecurringTransactions(prev => [...prev, newRecurring]);
                    setRecurringModalOpen(false);
                }} 
                onClose={() => setRecurringModalOpen(false)} 
            />
        </Modal>
    </div>
  );
}

export default App;