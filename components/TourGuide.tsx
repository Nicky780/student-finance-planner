import React, { useState, useEffect, useRef } from 'react';

interface TourGuideProps {
  run: boolean;
  onStepChange?: (stepIndex: number, stepTarget: string) => void;
}

const TOUR_STEPS = [
  {
    target: '#nav-menu',
    title: 'Navigation Menu',
    content: 'Welcome! Tap here any time to open your navigation menu and explore different parts of the app.',
    mobileOnly: true,
  },
  {
    target: '#nav-dashboard',
    title: 'Dashboard',
    content: 'This is your financial command center. Get a quick overview of your balance, income, expenses, and savings goals right here.',
  },
  {
    target: '#nav-transactions',
    title: 'Transactions Page',
    content: 'View, add, or delete any of your income or expense records. You can also generate a financial statement from here.',
  },
  {
    target: '#nav-budgets',
    title: 'Budgets Page',
    content: 'Stay on track with your spending by setting monthly budgets for different categories like food or transport.',
  },
  {
    target: '#nav-savings',
    title: 'Savings Page',
    content: 'Got something you\'re saving for? Create a goal, track your progress, and stay motivated!',
  },
  {
    target: '#nav-loans',
    title: 'Loans Page',
    content: 'Manage your student loans, like HELB, by tracking your balance and logging payments.',
  },
  {
    target: '#nav-recurring',
    title: 'Recurring Page',
    content: 'Automate your finances! Add recurring bills and income like rent, subscriptions, or weekly allowances here.',
  },
  {
    target: '#nav-learn',
    title: 'Learn Page',
    content: 'Have a financial question? Chat with our AI-powered advisor, FinPal, for tips and advice tailored for Kenyan students.',
  },
  {
    target: '#dashboard-balance',
    title: 'Your Total Balance',
    content: 'This card shows your current total balance, which is your total income minus your total expenses.',
  },
  {
    target: '#settings-button',
    title: 'Settings',
    content: 'Manage notification preferences and switch between light and dark mode here.',
  },
  {
    target: '#add-recurring-button',
    title: 'Add Recurring Items',
    content: 'Use this button to quickly add recurring transactions, like your monthly rent or a weekly allowance. Set it once and let the app track it for you!',
  },
  {
    target: '#add-transaction-button',
    title: 'Add a Transaction',
    content: 'This is the main action button! Tap the plus icon anytime to add a new income or expense record. Keeping your transactions up-to-date is key!',
  }
];

const TourGuide: React.FC<TourGuideProps> = ({ run, onStepChange }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsActive(run);
    if (run) {
      setStepIndex(0);
    }
  }, [run]);

  useEffect(() => {
    if (!isActive) return;

    let currentStep = TOUR_STEPS[stepIndex];
    if (currentStep.mobileOnly && window.innerWidth >= 768) {
        // Skip mobile-only step on desktop
        handleNext();
        return;
    }

    if (onStepChange) {
      onStepChange(stepIndex, currentStep.target);
    }

    const selector = `[data-tour-id="${currentStep.target.substring(1)}"]`;
    const targetElement = document.querySelector(selector);
    
    if (!targetElement) {
        if(stepIndex < TOUR_STEPS.length - 1) {
            handleNext();
        } else {
            handleFinish();
        }
        return;
    }

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    const timer = setTimeout(() => {
      const updatedRect = targetElement.getBoundingClientRect();
      setPosition(updatedRect);

      const tooltipEl = tooltipRef.current;
      if (tooltipEl) {
          const tooltipRect = tooltipEl.getBoundingClientRect();
          let top = updatedRect.bottom + 10;
          let left = updatedRect.left + (updatedRect.width / 2) - (tooltipRect.width / 2);

          if (top + tooltipRect.height > window.innerHeight) {
              top = updatedRect.top - tooltipRect.height - 10;
          }
          if (left < 10) left = 10;
          if (left + tooltipRect.width > window.innerWidth - 10) {
              left = window.innerWidth - tooltipRect.width - 10;
          }

          setTooltipPos({ top: Math.max(top, 10), left });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isActive, stepIndex]);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    setStepIndex(0);
  };

  if (!isActive || !position.width) return null;

  const currentStep = TOUR_STEPS[stepIndex];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50" onClick={handleFinish}></div>
      <div
        className="fixed border-4 border-indigo-500 rounded-lg shadow-2xl transition-all duration-300 pointer-events-none z-[60]"
        style={{
          top: `${position.top - 4}px`,
          left: `${position.left - 4}px`,
          width: `${position.width + 8}px`,
          height: `${position.height + 8}px`,
        }}
      ></div>

      <div
        ref={tooltipRef}
        className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72 z-[60] transition-all duration-300"
        style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
      >
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{currentStep.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{currentStep.content}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-400">{stepIndex + 1} / {TOUR_STEPS.length}</span>
          <div className="space-x-2">
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md">Previous</button>
            )}
            {stepIndex < TOUR_STEPS.length - 1 ? (
              <button onClick={handleNext} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md">Next</button>
            ) : (
              <button onClick={handleFinish} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md">Finish</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TourGuide;
