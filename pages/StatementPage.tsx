import React from 'react';
import type { Transaction } from '../types';
import { ICONS } from '../constants';

interface StatementPageProps {
  user: { name: string } | null;
  transactions: Transaction[];
  startDate: string;
  endDate: string;
  onBack: () => void;
}

const StatementPage: React.FC<StatementPageProps> = ({ user, transactions, startDate, endDate, onBack }) => {

  const statementTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
  });

  const income = statementTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = statementTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = income - expenses;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <header className="flex justify-between items-start mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Statement</h1>
            <p className="text-gray-500 dark:text-gray-400">For: {user?.name || 'User'}</p>
            <p className="text-gray-500 dark:text-gray-400">
              Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="no-print flex space-x-2">
             <button onClick={() => window.print()} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">
                {ICONS.print}
                <span>Print</span>
            </button>
            <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">
              Back
            </button>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">KSH {income.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">KSH {expenses.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg ${netFlow >= 0 ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
              <p className={`text-sm ${netFlow >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-yellow-800 dark:text-yellow-300'}`}>Net Cash Flow</p>
              <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>KSH {netFlow.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Transaction Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Amount (KSH)</th>
                </tr>
              </thead>
              <tbody>
                {statementTransactions.length > 0 ? statementTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{t.category}</td>
                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{t.description || '-'}</td>
                    <td className={`p-3 text-sm font-medium text-right ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-gray-500 dark:text-gray-400">
                      No transactions found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatementPage;