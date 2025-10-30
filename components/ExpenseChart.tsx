import React from 'react';
import type { Transaction } from '../types';

interface ExpenseChartProps {
    transactions: Transaction[];
}

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
    const expenses = transactions.filter(t => t.type === 'expense');

    // FIX: By explicitly typing the initial value for the reduce function, we ensure
    // that `expensesByCategory` is correctly typed. This resolves a cascade of
    // downstream type errors where amounts were inferred as `unknown`.
    const expensesByCategory = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as { [key: string]: number });

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

    if (totalExpenses === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">No expense data to display.</p>
            </div>
        );
    }

    const sortedData = Object.entries(expensesByCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="w-48 h-48 flex-shrink-0">
                 <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
                    {sortedData.map(({ amount }, index) => {
                        const percent = amount / totalExpenses;
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const pathData = [
                            `M ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `L 0 0`,
                        ].join(' ');

                        return <path key={index} d={pathData} fill={COLORS[index % COLORS.length]} />;
                    })}
                </svg>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto">
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white">Expense Breakdown</h4>
                <ul className="space-y-1">
                    {sortedData.slice(0, 5).map(({ category, amount }, index) => (
                         <li key={category} className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-gray-700 dark:text-gray-300">{category}:</span>
                            <span className="font-semibold ml-auto text-gray-800 dark:text-gray-200">KSH {amount.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExpenseChart;