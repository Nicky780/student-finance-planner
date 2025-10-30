import React, { useState, useMemo } from 'react';
import type { Transaction, Budget } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import Modal from '../components/Modal';

interface BudgetsPageProps {
  transactions: Transaction[];
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
}

const BudgetCategoryItem: React.FC<{
    budget: Budget;
    spent: number;
    onDelete: (category: string) => void;
}> = ({ budget, spent, onDelete }) => {
    const progress = (spent / budget.limit) * 100;
    const isOverBudget = progress > 100;
    
    let progressBarColor = 'bg-indigo-600';
    if (progress > 75) progressBarColor = 'bg-yellow-500';
    if (isOverBudget) progressBarColor = 'bg-red-500';

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-3">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-900 dark:text-white">{budget.category}</p>
                <button onClick={() => onDelete(budget.category)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
            </div>
            <div className="flex justify-between items-center text-sm mb-1 text-gray-600 dark:text-gray-300">
                <p>Spent: KSH {spent.toFixed(2)}</p>
                <p>Limit: KSH {budget.limit.toFixed(2)}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            {isOverBudget && <p className="text-red-500 text-xs mt-1">You're over budget by KSH {(spent - budget.limit).toFixed(2)}!</p>}
        </div>
    );
};

const AddBudgetForm: React.FC<{ onSave: (budget: Budget) => void; existingCategories: string[] }> = ({ onSave, existingCategories }) => {
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');

    const availableCategories = EXPENSE_CATEGORIES.filter(c => !existingCategories.includes(c) && c !== "Loan Payment");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategory = category || availableCategories[0];
        if (!selectedCategory || !limit) return;
        onSave({ category: selectedCategory, limit: parseFloat(limit) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Limit (KSH)</label>
                <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 50000" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Add Budget</button>
        </form>
    );
};


const BudgetsPage: React.FC<BudgetsPageProps> = ({ transactions, budgets, setBudgets }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expensesByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });
  }, [transactions]);
  
  const handleAddBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
    setIsModalOpen(false);
  }

  const handleDeleteBudget = (category: string) => {
      if (window.confirm(`Are you sure you want to remove the budget for ${category}?`)) {
          setBudgets(prev => prev.filter(b => b.category !== category));
      }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Budgets</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">
            New Budget
        </button>
      </div>

      {budgets.length > 0 ? (
          budgets.map(budget => (
              <BudgetCategoryItem 
                key={budget.category} 
                budget={budget} 
                spent={expensesByCategory[budget.category] || 0} 
                onDelete={handleDeleteBudget}
              />
          ))
      ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">You haven't set any budgets yet.</p>
              <p className="text-gray-500 dark:text-gray-400">Click 'New Budget' to get started!</p>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Budget">
          <AddBudgetForm onSave={handleAddBudget} existingCategories={budgets.map(b => b.category)} />
      </Modal>

    </div>
  );
};

export default BudgetsPage;