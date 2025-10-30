import React from 'react';
import type { Transaction } from '../../types';

interface IncomeVsExpenseChartProps {
    transactions: Transaction[];
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ transactions }) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (income === 0 && expenses === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data to display.</div>;
    }

    const maxVal = Math.max(income, expenses, 1);

    const incomeHeight = (income / maxVal) * 100;
    const expenseHeight = (expenses / maxVal) * 100;

    return (
        <div className="h-full w-full flex flex-col justify-end items-center p-4">
            <div className="flex-grow flex items-end justify-center space-x-8 w-full h-full">
                 <div className="flex flex-col items-center flex-1 max-w-[100px]">
                     <div 
                        className="w-full bg-green-500 rounded-t-lg transition-all duration-500" 
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: KSH ${income.toFixed(2)}`}
                     ></div>
                     <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Income</span>
                 </div>
                 <div className="flex flex-col items-center flex-1 max-w-[100px]">
                     <div 
                        className="w-full bg-red-500 rounded-t-lg transition-all duration-500" 
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: KSH ${expenses.toFixed(2)}`}
                     ></div>
                     <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Expenses</span>
                 </div>
            </div>
        </div>
    );
};

export default IncomeVsExpenseChart;
