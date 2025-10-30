import React from 'react';
import Modal from './Modal';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onStartTour, onSkip }) => {
  return (
    <Modal isOpen={isOpen} onClose={onSkip} title="Welcome to FinPal!">
      <div className="text-gray-600 dark:text-gray-300 space-y-4">
        <p>We're excited to help you take control of your finances. FinPal is designed to make managing your money simple and effective.</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Track</strong> your income and expenses with ease.</li>
          <li><strong>Create budgets</strong> to stay on top of your spending.</li>
          <li><strong>Set and achieve</strong> your savings goals.</li>
          <li><strong>Get smart tips</strong> from our AI financial advisor.</li>
        </ul>
        <p>Would you like a quick tour to see how everything works?</p>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onSkip} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500">
            Maybe Later
          </button>
          <button onClick={onStartTour} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Start Tour
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
