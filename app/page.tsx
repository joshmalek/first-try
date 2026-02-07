"use client";
import React, { useState, useEffect } from 'react';

export default function KanyeOS() {
  const [stage, setStage] = useState('boot'); // boot, terminal
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM READY...']);
  const [isThinking, setIsThinking] = useState(false);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    setHistory(prev => [...prev, `> ${cmd}`]);
    setInput('');

    if (cmd.startsWith('ask ')) {
      setIsThinking(true);
      try {
        const res = await fetch('https://inexplicit-yvonne-trophically.ngrok-free.dev/api/generate', {
          method: 'POST',
          body: JSON.stringify({
            model: 'deepseek-coder-v2:lite',
            prompt: cmd.replace('ask ', ''),
            stream: false
          })
        });
        const data = await res.json();
        setHistory(prev => [...prev, `GPU_CORE_2026: ${data.response}`]);
      } catch (err) {
        setHistory(prev => [...prev, "!! ERROR: 5070TI_OFFLINE !!"]);
      }
      setIsThinking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-green-500">
      <div className="w-full max-w-2xl border border-green-900 p-6 bg-black">
        <div className="h-80 overflow-y-auto mb-4 space-y-2">
          {history.map((line, i) => <p key={i}>{line}</p>)}
          {isThinking && <p className="animate-pulse">CRUNCHING_ON_5070TI...</p>}
        </div>
        <form onSubmit={handleCommand} className="flex">
          <span className="mr-2">➜</span>
          <input 
            className="bg-transparent outline-none w-full text-green-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask write a python script..."
          />
        </form>
      </div>
    </main>
  );
}