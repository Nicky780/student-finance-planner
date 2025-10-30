import React, { useState } from 'react';
import type { StudentLoan } from '../types';
import Modal from '../components/Modal';

interface LoansPageProps {
  loans: StudentLoan[];
  setLoans: React.Dispatch<React.SetStateAction<StudentLoan[]>>;
  onAddPayment: (loanId: string, amount: number) => void;
}

const AddLoanForm: React.FC<{ onSave: (loan: Omit<StudentLoan, 'id' | 'currentBalance' | 'paymentHistory'>) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
    const [lender, setLender] = useState('');
    const [initialAmount, setInitialAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [paymentDueDate, setPaymentDueDate] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!lender || !initialAmount || !interestRate || !paymentDueDate) return;
        onSave({ 
            lender, 
            initialAmount: parseFloat(initialAmount), 
            interestRate: parseFloat(interestRate),
            paymentDueDate: parseInt(paymentDueDate)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lender Name</label>
                <input type="text" value={lender} onChange={e => setLender(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="e.g., HELB, KCB" required/>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Loan Amount (KSH)</label>
                    <input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="250000" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                    <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="4" required/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Payment Due Day</label>
                <input type="number" min="1" max="31" value={paymentDueDate} onChange={e => setPaymentDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="e.g., 5 for 5th of the month" required/>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Loan</button>
            </div>
        </form>
    );
};

const LoanCard: React.FC<{ loan: StudentLoan; onAddPayment: (id: string, amount: number) => void; onDelete: (id: string) => void; }> = ({ loan, onAddPayment, onDelete }) => {
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const [amountToPay, setAmountToPay] = useState('');

    const handlePayment = () => {
        const amount = parseFloat(amountToPay);
        if (isNaN(amount) || amount <= 0) return;
        onAddPayment(loan.id, amount);
        setAmountToPay('');
        setPayModalOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
            <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{loan.lender}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment due on day {loan.paymentDueDate} of the month</p>
                </div>
                <button onClick={() => onDelete(loan.id)} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Principal</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">KSH {loan.initialAmount.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-gray-500 dark:text-gray-400">Interest</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{loan.interestRate}%</p>
                </div>
            </div>
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Remaining Balance</p>
                <p className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">KSH {loan.currentBalance.toFixed(2)}</p>
            </div>
            <button onClick={() => setPayModalOpen(true)} className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 text-sm font-semibold">Log a Payment</button>
            
            <Modal isOpen={isPayModalOpen} onClose={() => setPayModalOpen(false)} title={`Pay ${loan.lender} Loan`}>
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Amount (KSH)</label>
                    <input type="number" value={amountToPay} onChange={e => setAmountToPay(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" placeholder="5000" />
                    <button onClick={handlePayment} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Confirm Payment</button>
                </div>
            </Modal>
        </div>
    );
}

const LoansPage: React.FC<LoansPageProps> = ({ loans, setLoans, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleAddLoan = (loanData: Omit<StudentLoan, 'id' | 'currentBalance' | 'paymentHistory'>) => {
      const newLoan: StudentLoan = {
          ...loanData,
          id: new Date().getTime().toString(),
          currentBalance: loanData.initialAmount,
          paymentHistory: [],
      };
      setLoans(prev => [...prev, newLoan]);
      setIsModalOpen(false);
  };

  const handleDeleteLoan = (id: string) => {
      if(window.confirm("Are you sure you want to delete this loan? All payment history will be lost.")) {
          setLoans(prev => prev.filter(loan => loan.id !== id));
      }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Loans</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">Add Loan</button>
      </div>

      {loans.length > 0 ? (
          loans.map(loan => (
              <LoanCard key={loan.id} loan={loan} onAddPayment={onAddPayment} onDelete={handleDeleteLoan} />
          ))
      ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">No student loans tracked yet.</p>
              <p className="text-gray-500 dark:text-gray-400">Click 'Add Loan' to get started.</p>
          </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Loan">
          <AddLoanForm onSave={handleAddLoan} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default LoansPage;
