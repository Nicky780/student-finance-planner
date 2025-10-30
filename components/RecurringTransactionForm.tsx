import React, { useState } from 'react';
import type { RecurringTransaction, TransactionType, Frequency } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface RecurringTransactionFormProps {
  onSave: (transaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => void;
  onClose: () => void;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ onSave, onClose }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay());
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getDate());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !startDate) {
        alert("Please fill all required fields.");
        return;
    }
    
    const recurringData: Omit<RecurringTransaction, 'id' | 'nextDueDate'> = {
        type,
        amount: parseFloat(amount),
        category,
        description,
        frequency,
        startDate,
    };

    if (frequency === 'weekly') {
        recurringData.dayOfWeek = dayOfWeek;
    } else {
        recurringData.dayOfMonth = dayOfMonth;
    }

    onSave(recurringData);
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <div className="flex rounded-md shadow-sm">
          <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-l-lg w-1/2 ${type === 'expense' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
            Expense
          </button>
          <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-700 rounded-r-lg w-1/2 ${type === 'income' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
            Income
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (KSH)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="1000.00" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="e.g., Monthly Rent" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
            </select>
        </div>
        <div>
            {frequency === 'weekly' ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Week</label>
                    <select value={dayOfWeek} onChange={(e) => setDayOfWeek(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                       {weekDays.map((day, index) => <option key={index} value={index}>{day}</option>)}
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Month</label>
                    <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                </div>
            )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save</button>
      </div>
    </form>
  );
};

export default RecurringTransactionForm;