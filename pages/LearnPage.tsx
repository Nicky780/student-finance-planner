import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { ICONS } from '../constants';

// A simple markdown renderer
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        // Simple bold and list item rendering
        const parts = content.split(/(\*\*.*?\*\*|\* .*)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('* ')) {
                return <li className="ml-5 list-disc" key={index}>{part.slice(2)}</li>;
            }
            return part;
        });
    };

    return <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">{renderContent()}</div>;
};

const QuickActionButton: React.FC<{ text: string, onClick: (text: string) => void}> = ({ text, onClick }) => (
    <button onClick={() => onClick(text)} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
        {text}
    </button>
);

const LearnPage: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm FinPal, your personal finance guide. Ask me anything about budgeting, saving, or student finance in Kenya!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [chatHistory]);

  const handleSendMessage = async (messageText = userInput) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const modelResponseText = await getFinancialAdvice(messageText, chatHistory);
    
    const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
    setChatHistory(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  const handleQuickAction = (text: string) => {
      handleSendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.25rem)]">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learn with FinPal AI</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your AI-powered financial advisor.</p>
      </header>

      <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <MarkdownRenderer content={msg.text} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            <QuickActionButton text="Suggest a side hustle" onClick={handleQuickAction} />
            <QuickActionButton text="Find student deals" onClick={handleQuickAction} />
            <QuickActionButton text="Explain compound interest" onClick={handleQuickAction} />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about saving tips..."
            className="flex-grow bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isLoading || !userInput.trim()} 
            className="bg-indigo-600 text-white rounded-full p-3 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {ICONS.send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;