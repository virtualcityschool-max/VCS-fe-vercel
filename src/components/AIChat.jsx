
import React, { useState } from 'react';
import { askLearningAssistant } from '../services/gemini';

// interface AIChatProps {
//   currentView: AppView;
// }

const AIChat = ({ currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'user', text: '' }, { role: 'ai', text: '' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await askLearningAssistant(userMsg, currentView);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse || '...' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden glass">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <span className="font-semibold"><i className="fas fa-robot mr-2"></i>AI Assistant</span>
            <button onClick={() => setIsOpen(false)}><i className="fas fa-times"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-slate-400 text-sm italic">Ask me anything about the {currentView} page!</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-slate-500 text-xs italic">Thinking...</div>}
          </div>
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 bg-slate-800 text-white border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button onClick={handleSend} className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-500 transition">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <i className="fas fa-magic text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default AIChat;
