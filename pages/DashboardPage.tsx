import React, { useState, useEffect } from 'react';
import type { Transaction, SavingsGoal } from '../types';
import { getDailyTip } from '../services/geminiService';
import ExpenseChart from '../components/ExpenseChart';
import { ICONS } from '../constants';

interface DashboardPageProps {
  user: { name: string };
  onLogout: () => void;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onNavigateToSettings: () => void;
}

const StatCard: React.FC<{ title: string; amount: number; color: string; }> = ({ title, amount, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>KSH {amount.toFixed(2)}</p>
    </div>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="flex justify-between items-center py-3">
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{transaction.category}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description || 'No description'}</p>
        </div>
        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {transaction.type === 'income' ? '+' : '-'}KSH {transaction.amount.toFixed(2)}
        </p>
    </div>
);

const SavingsGoalItem: React.FC<{ goal: SavingsGoal }> = ({ goal }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-3">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{goal.name}</p>
                <p className="text-sm font-bold text-indigo-500">KSH {goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, transactions, savingsGoals, balance, totalIncome, totalExpenses, theme, toggleTheme, onNavigateToSettings }) => {
  const [dailyTip, setDailyTip] = useState('Loading your daily tip...');

  useEffect(() => {
    const fetchTip = async () => {
      const tip = await getDailyTip();
      setDailyTip(tip);
    };
    fetchTip();
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back, {user.name}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Here's your financial summary.</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} title="Toggle Theme" className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {theme === 'light' ? ICONS.moon : ICONS.sun}
            </button>
            <button data-tour-id="settings-button" onClick={onNavigateToSettings} title="Settings" className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {ICONS.settings}
            </button>
             <button onClick={onLogout} title="Change User" className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {ICONS.logout}
            </button>
        </div>
      </header>
      
      <div className="bg-indigo-600 text-white p-5 rounded-lg shadow-lg" data-tour-id="dashboard-balance">
        <p className="text-sm opacity-80">Total Balance</p>
        <p className="text-4xl font-extrabold">KSH {balance.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Income" amount={totalIncome} color="text-green-500" />
        <StatCard title="Total Expenses" amount={totalExpenses} color="text-red-500" />
      </div>
      
       <ExpenseChart transactions={transactions} />

       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Daily Tip ✨</h3>
            <p className="text-gray-600 dark:text-gray-300 italic">{dailyTip}</p>
       </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No transactions yet. Add one to get started!</p>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Savings Goals</h3>
        {savingsGoals.length > 0 ? (
          <div>
            {savingsGoals.map(g => <SavingsGoalItem key={g.id} goal={g} />)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No savings goals yet. Create one to start saving!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;