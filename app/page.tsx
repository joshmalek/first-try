"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function KanyeOS() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM ONLINE...', 'GPU: RTX 5070 Ti 16GB DETECTED']);
  const [isThinking, setIsThinking] = useState(false);
  const [gpuStats, setGpuStats] = useState({ temp: 0, vram: 0 });
  const [sessionSavings, setSessionSavings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setGpuStats(data);
      } catch (e) {}
    };
    const interval = setInterval(getStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    if (prompt.toLowerCase() === 'clear') { 
      setHistory(['REBOOTED...']); 
      return setInput('');
    }

    setHistory(prev => [...prev, `➜ ${prompt}`, `[5070_TI_OUTPUT]:`, ""]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.includes("__STATS__")) {
          const statsMatch = chunk.match(/__STATS__(.*)__/);
          if (statsMatch) {
            const stats = JSON.parse(statsMatch[1]);
            const currentSavings = (stats.tokens / 1000000 * 15.00);
            setSessionSavings(prev => prev + currentSavings);
            setTotalTokens(prev => prev + stats.tokens);
            setHistory(prev => [...prev.slice(0, -1), fullText, "-------------------"]);
          }
        } else {
          fullText += chunk;
          setHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = fullText;
            return newHistory;
          });
        }
        setIsThinking(false);
      }
    } catch (err) {
      setHistory(prev => [...prev, "!! ERROR: GPU DISCONNECTED !!"]);
      setIsThinking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-green-500 p-4">
      {/* Main Terminal Box */}
      <div className="w-full max-w-3xl border-2 border-green-900 rounded-lg bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)]">
        <div className="bg-green-900/20 px-4 py-2 border-b border-green-900 text-[10px] flex justify-between uppercase tracking-widest">
          <span>AUHSOJ_OS // CORE_2026</span>
          <span className={gpuStats.temp > 75 ? "text-red-500 animate-pulse" : "text-green-400"}>
            TEMP: {gpuStats.temp}°C | VRAM: {gpuStats.vram}GB / 16GB
          </span>
        </div>

        <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-3 text-sm scrollbar-hide">
          {history.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
          {isThinking && <div className="animate-pulse">CRUNCHING_DATA...</div>}
        </div>

        <form onSubmit={handleCommand} className="p-4 border-t border-green-900 flex">
          <span className="mr-3 text-green-400 font-bold">➜</span>
          <input 
            autoFocus className="bg-transparent outline-none w-full text-green-400"
            value={input} onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>

      {/* Session Savings Dashboard */}
      <div className="w-full max-w-3xl mt-4 grid grid-cols-3 gap-4 text-[10px] uppercase tracking-widest">
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800 mb-1">Session Tokens</div>
          <div className="text-lg font-bold text-green-400">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800 mb-1">Cloud Equivalent</div>
          <div className="text-lg font-bold text-green-400">${(totalTokens / 1000000 * 15.00).toFixed(4)}</div>
        </div>
        <div className="border border-green-500/20 p-3 bg-green-500/10 rounded shadow-[0_0_10px_rgba(34,197,94,0.05)]">
          <div className="text-green-400 mb-1 font-bold italic underline">Total Net Savings</div>
          <div className="text-lg font-bold text-white">${sessionSavings.toFixed(4)}</div>
        </div>
      </div>
    </main>
  );
}