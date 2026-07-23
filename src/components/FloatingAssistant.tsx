import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, Leaf } from 'lucide-react';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am AgroSaathi AI. How can I help you with your farming needs today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Mock bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { id: Date.now(), type: 'bot', text: 'I understand. Let me analyze that for you.' }
      ]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative p-4 bg-brand text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sprout size={28} className="text-brand-accent" />
              </motion.div>
              
              {/* Outer pulsing ring */}
              <span className="absolute inset-0 rounded-full bg-brand-accent opacity-20 animate-ping"></span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[100] sm:w-[380px] sm:h-[600px] flex flex-col bg-white/80 backdrop-blur-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/40"
          >
            {/* Header */}
            <div className="bg-brand text-white p-4 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <Sprout size={22} className="text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight flex items-center gap-1">
                    🌱 AgroSaathi AI
                  </h3>
                  <div className="flex items-center text-xs text-brand-light mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#B8F24A] mr-1.5 animate-pulse shadow-[0_0_8px_#B8F24A]"></span>
                    Online • Agricultural Assistant
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-light hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-light/30 scroll-smooth">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-white text-gray-800 rounded-tr-sm border border-gray-100/50' 
                        : 'bg-brand text-white rounded-tl-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-brand text-white px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1.5 h-10">
                    <motion.div className="w-1.5 h-1.5 bg-brand-accent rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-accent rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-accent rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about crops, diseases..."
                  className="flex-1 bg-gray-50/80 text-gray-800 text-[15px] border border-gray-100 focus:border-brand-light focus:bg-white focus:ring-2 focus:ring-brand-light/50 rounded-full px-5 py-3 outline-none transition-all placeholder:text-gray-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-brand text-brand-accent p-3 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:hover:bg-brand disabled:cursor-not-allowed shadow-sm flex-shrink-0 group"
                >
                  <Leaf size={20} className="group-hover:-rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
