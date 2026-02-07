"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function KanyeOS() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM READY...', 'TYPE "ask [question]" TO CONSULT 5070_TI']);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when terminal updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isThinking]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim(); // No more 'ask ' check
    if (!prompt) return;
  
    setHistory(prev => [...prev, `➜ ${prompt}`]);
    setInput('');
    
    // Special case for 'clear' if you still want it
    if (prompt.toLowerCase() === 'clear') {
      setHistory(['SYSTEM REBOOTED...']);
      return;
    }
  
    setIsThinking(true);
    setHistory(prev => [...prev, `[5070_TI_OUTPUT]:`, ""]); 
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt }), // Just send the raw input
      });
  
      if (!response.body) throw new Error("No response body");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
  
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = accumulatedText;
          return newHistory;
        });
        
        setIsThinking(false); 
      }
    } catch (err) {
      setHistory(prev => [...prev, "!! ERROR: STREAM INTERRUPTED !!"]);
      setIsThinking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-green-500 p-4">
      <div className="w-full max-w-3xl border-2 border-green-900 rounded-lg shadow-[0_0_20px_rgba(0,50,0,0.5)] bg-black overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-green-900/20 px-4 py-1 border-b border-green-900 text-xs flex justify-between">
          <span>KANYE_OS_V1.0</span>
          <span>GPU_TEMP: 42°C | VRAM: 16GB</span>
        </div>

        {/* Output Area */}
        <div 
          ref={scrollRef}
          className="h-[500px] overflow-y-auto p-6 space-y-2 text-sm md:text-base scrollbar-hide"
        >
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              {line}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center space-x-2 text-yellow-500 italic">
              <span className="animate-spin">🌀</span>
              <span>5070_TI IS CRUNCHING_DATA...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommand} className="p-4 border-t border-green-900 bg-black/50 flex items-center">
          <span className="mr-3 text-green-400 font-bold font-mono">➜</span>
          <input 
            autoFocus
            className="bg-transparent outline-none w-full text-green-400 placeholder-green-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask write a script to hack into the mainframe..."
          />
        </form>
      </div>
    </main>
  );
}