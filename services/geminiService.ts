import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const getChat = () => {
    const aiInstance = getAI();
    if (!chat) {
        chat = aiInstance.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are 'FinPal', a friendly and knowledgeable financial advisor for university students in Kenya. Your advice should be practical, easy to understand, and tailored to a Kenyan student's lifestyle (mentioning things like HELB, M-Pesa, and local side hustles is a plus). Avoid complex jargon and focus on actionable steps. Always be encouraging and supportive. Use markdown for formatting, like lists and bold text, to make your advice clear and engaging.",
            },
        });
    }
    return chat;
}

export const getFinancialAdvice = async (message: string, history: ChatMessage[]) => {
    try {
        const chatInstance = getChat();
        
        // The service uses its own history, but we can pass previous context if needed.
        // For simplicity here, we'll just send the latest message.
        // A more complex implementation could sync history.
        const result = await chatInstance.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error getting financial advice:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

export const getDailyTip = async (): Promise<string> => {
    try {
        const aiInstance = getAI();
        const result = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give me a single, concise financial tip for a university student in Kenya. Make it short, impactful, and easy to act on. The tip should be no more than 2 sentences.",
        });
        return result.text;
    } catch (error) {
        console.error("Error getting daily tip:", error);
        return "Could not fetch a tip. Remember to track your spending today!";
    }
};