import React from 'react';
import type { Transaction } from '../../types';

interface SpendingTrendsChartProps {
    transactions: Transaction[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ transactions }) => {
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (expenses.length < 1) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No expense data for a trend chart.</div>;
    }

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const average = totalExpenses / expenses.length;

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500">KSH {totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Avg. Transaction: KSH {average.toFixed(2)}</p>
            </div>
            <div className="flex-grow flex items-center justify-center text-gray-400 dark:text-gray-500 mt-4">
                <p className="text-center">A full chart with a library like Chart.js or D3.js would be implemented here to show spending over time.</p>
            </div>
        </div>
    );
};

export default SpendingTrendsChart;
