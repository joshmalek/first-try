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
    const cmd = input.trim();
    if (!cmd) return;

    setHistory(prev => [...prev, `➜ ${cmd}`]);
    setInput('');

    // Handle "ask" command
    if (cmd.toLowerCase().startsWith('ask ')) {
      const prompt = cmd.substring(4);
      setIsThinking(true);

      try {
        const response = await fetch('https://inexplicit-yvonne-trophically.ngrok-free.dev/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true', // Bypasses ngrok warning page
          },
          body: JSON.stringify({
            model: 'deepseek-coder-v2:lite',
            prompt: prompt,
            stream: false, // Set to false for a simpler single-string response
          }),
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        console.log("GPU Response:", data); // Check your browser console (F12) to see this
        
        setHistory(prev => [...prev, `[5070_TI_OUTPUT]:`, data.response]);
      } catch (err) {
        console.error("Fetch Error:", err);
        setHistory(prev => [...prev, "!! ERROR: SYSTEM OFFLINE OR TUNNEL TIMEOUT !!"]);
      } finally {
        setIsThinking(false);
      }
    } else if (cmd.toLowerCase() === 'clear') {
      setHistory(['SYSTEM REBOOTED...']);
    } else {
      setHistory(prev => [...prev, `COMMAND NOT RECOGNIZED: ${cmd}`]);
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