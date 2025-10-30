import React, { useState } from 'react';
import type { SavingsGoal } from '../types';
import Modal from '../components/Modal';

interface SavingsPageProps {
  savingsGoals: SavingsGoal[];
  setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
}

const AddSavingsGoalForm: React.FC<{ onSave: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !targetAmount || !deadline) return;
        onSave({ name, targetAmount: parseFloat(targetAmount), deadline });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., New Laptop" required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount (KSH)</label>
                <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="150000" required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Goal</button>
            </div>
        </form>
    );
};

const SavingsGoalCard: React.FC<{ goal: SavingsGoal; onAddFunds: (id: string, amount: number) => void; onDelete: (id: string) => void; }> = ({ goal, onAddFunds, onDelete }) => {
    const [amountToAdd, setAmountToAdd] = useState('');
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
                <button onClick={() => onDelete(goal.id)} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            </div>
            <div>
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span>KSH {goal.currentAmount.toFixed(2)}</span>
                    <span>KSH {goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-1">
                    <div className="bg-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${progress}%` }}>
                        {progress.toFixed(0)}%
                    </div>
                </div>
            </div>
            <div className="flex space-x-2">
                <input type="number" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} className="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Add funds (KSH)"/>
                <button onClick={() => { onAddFunds(goal.id, parseFloat(amountToAdd || '0')); setAmountToAdd(''); }} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap">Add +</button>
            </div>
        </div>
    );
}

const SavingsPage: React.FC<SavingsPageProps> = ({ savingsGoals, setSavingsGoals }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
      const newGoal: SavingsGoal = {
          ...goalData,
          id: new Date().getTime().toString(),
          currentAmount: 0,
      };
      setSavingsGoals(prev => [...prev, newGoal]);
      setIsModalOpen(false);
  };
  
  const handleAddFunds = (id: string, amount: number) => {
      if (isNaN(amount) || amount <= 0) return;
      setSavingsGoals(prev => prev.map(goal => 
          goal.id === id ? { ...goal, currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount) } : goal
      ));
  };
  
  const handleDeleteGoal = (id: string) => {
      if(window.confirm("Are you sure you want to delete this savings goal?")) {
          setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
      }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">New Goal</button>
      </div>

      {savingsGoals.length > 0 ? (
          savingsGoals.map(goal => (
              <SavingsGoalCard key={goal.id} goal={goal} onAddFunds={handleAddFunds} onDelete={handleDeleteGoal} />
          ))
      ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">No savings goals yet.</p>
              <p className="text-gray-500 dark:text-gray-400">Let's create one and start saving for your dreams!</p>
          </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Savings Goal">
          <AddSavingsGoalForm onSave={handleAddGoal} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default SavingsPage;