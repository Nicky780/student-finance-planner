import React, { useState } from 'react';
import type { Transaction } from '../types';
import Modal from '../components/Modal';
import StatementDateForm from '../components/StatementDateForm';

interface TransactionsPageProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onGenerateStatement: (startDate: string, endDate: string) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction; onDelete: (id: string) => void; }> = ({ transaction, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-3 flex items-center space-x-4">
        <div className={`w-2 h-16 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{transaction.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">{new Date(transaction.date).toLocaleDateString()}</p>
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

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, setTransactions, onGenerateStatement }) => {
  const [filter, setFilter] = useState('all');
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };
  
  const handleGenerate = (startDate: string, endDate: string) => {
      setIsStatementModalOpen(false);
      onGenerateStatement(startDate, endDate);
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
        <button onClick={() => setIsStatementModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">
            Generate Statement
        </button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>All</button>
        <button onClick={() => setFilter('income')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === 'income' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Income</button>
        <button onClick={() => setFilter('expense')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === 'expense' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Expenses</button>
      </div>

      {filteredTransactions.length > 0 ? (
        <div>
          {filteredTransactions.map(t => (
            <TransactionRow key={t.id} transaction={t} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No transactions found for this filter.</p>
        </div>
      )}
      
      <Modal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} title="Generate Financial Statement">
        <StatementDateForm onGenerate={handleGenerate} onClose={() => setIsStatementModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default TransactionsPage;