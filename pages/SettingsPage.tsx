import React, { useState, useEffect } from 'react';
import type { NotificationSettings } from '../types';
import { requestNotificationPermission } from '../services/notificationService';

interface SettingsPageProps {
  settings: NotificationSettings;
  setSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
  onBack: () => void;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; description: string; }> = ({ label, enabled, onChange, description }) => (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div>
            <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings, onBack }) => {
  const [permission, setPermission] = useState(Notification.permission);

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    setPermission(Notification.permission);
  };

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center mb-2">
        <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Notifications</h2>
        {permission === 'granted' ? (
          <p className="text-sm text-green-600 dark:text-green-400">Notification permissions are enabled.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {permission === 'denied' 
                ? 'Notifications are blocked. You need to enable them in your browser settings.' 
                : 'Enable notifications to get helpful reminders.'}
            </p>
            {permission !== 'denied' && (
              <button onClick={handleRequestPermission} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700">
                Enable Notifications
              </button>
            )}
          </div>
        )}
      </div>
      
      {permission === 'granted' && (
        <div className="space-y-3">
          <Toggle 
            label="Budget Alerts"
            description="Get notified when you're nearing or over your budget."
            enabled={settings.budgetAlerts}
            onChange={(val) => handleToggle('budgetAlerts', val)}
          />
           <Toggle 
            label="Bill Reminders"
            description="Get reminders for upcoming recurring transactions."
            enabled={settings.billReminders}
            onChange={(val) => handleToggle('billReminders', val)}
          />
           <Toggle 
            label="Savings Goal Reminders"
            description="Get a nudge when a savings goal deadline is near."
            enabled={settings.savingsReminders}
            onChange={(val) => handleToggle('savingsReminders', val)}
          />
           <Toggle 
            label="Loan Payment Reminders"
            description="Get a reminder a few days before your loan is due."
            enabled={settings.loanReminders}
            onChange={(val) => handleToggle('loanReminders', val)}
          />
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
