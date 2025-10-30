import React, { useState } from 'react';
import type { RecurringTransaction } from '../types';
import Modal from '../components/Modal';
import RecurringTransactionForm from '../components/RecurringTransactionForm';

interface RecurringPageProps {
  recurringTransactions: RecurringTransaction[];
  setRecurringTransactions: React.Dispatch<React.SetStateAction<RecurringTransaction[]>>;
}

const RecurringTransactionRow: React.FC<{ transaction: RecurringTransaction; onDelete: (id: string) => void; }> = ({ transaction, onDelete }) => {
    const getFrequencyText = () => {
        if (transaction.frequency === 'weekly') {
            const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return `Weekly on ${weekDays[transaction.dayOfWeek!]}`;
        }
        return `Monthly on day ${transaction.dayOfMonth}`;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-3 flex items-center space-x-4">
            <div className={`w-2 h-16 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{transaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 pt-1 font-semibold">{getFrequencyText()}</p>
                    </div>
                    <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}KSH {transaction.amount.toFixed(2)}
                    </p>
                </div>
            </div>
            <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    );
};

const RecurringPage: React.FC<RecurringPageProps> = ({ recurringTransactions, setRecurringTransactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      setRecurringTransactions(recurringTransactions.filter(t => t.id !== id));
    }
  };

  const handleSave = (data: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => {
    const newRecurringTransaction: RecurringTransaction = {
      ...data,
      id: new Date().getTime().toString(),
      nextDueDate: data.startDate, // Initial due date is the start date
    };
    setRecurringTransactions(prev => [...prev, newRecurringTransaction]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">
            Add New
        </button>
      </div>
      
      {recurringTransactions.length > 0 ? (
        <div>
          {recurringTransactions.map(t => (
            <RecurringTransactionRow key={t.id} transaction={t} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">No recurring transactions set up yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add recurring expenses like rent or subscriptions to automate tracking.</p>
        </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Recurring Transaction">
        <RecurringTransactionForm onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default RecurringPage;