import React from 'react';
import type { Transaction } from '../types';
import SpendingTrendsChart from '../components/charts/SpendingTrendsChart';
import IncomeVsExpenseChart from '../components/charts/IncomeVsExpenseChart';

interface ReportsPageProps {
  transactions: Transaction[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
                <p className="text-gray-500 dark:text-gray-400">Analyze your spending and income patterns.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Income vs. Expense</h2>
                    <div className="h-64">
                        <IncomeVsExpenseChart transactions={transactions} />
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Summary</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Total Income:</span>
                            <span className="font-bold text-green-500">KSH {income.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Total Expenses:</span>
                            <span className="font-bold text-red-500">KSH {expenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-100 font-bold">Net Flow:</span>
                            <span className={`font-bold ${income - expenses >= 0 ? 'text-blue-500' : 'text-yellow-500'}`}>KSH {(income - expenses).toFixed(2)}</span>
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Spending Trends</h2>
                 <div className="h-80">
                    <SpendingTrendsChart transactions={transactions} />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
