"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function KanyeOS() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM ONLINE...', 'GPU: RTX 5070 Ti 16GB DETECTED']);
  const [isThinking, setIsThinking] = useState(false);
  const [gpuStats, setGpuStats] = useState({ temp: 0, vram: 0 }); // Real stats from sidekick
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for real GPU stats from your Python sidekick
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

    if (prompt.toLowerCase() === 'clear') { return setHistory(['REBOOTED...']); }

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
        
        // Check if this chunk contains our hidden stats tag
        if (chunk.includes("__STATS__")) {
          const statsMatch = chunk.match(/__STATS__(.*)__/);
          if (statsMatch) {
            const stats = JSON.parse(statsMatch[1]);
            const savings = (stats.tokens / 1000000 * 15.00).toFixed(4); // $15/1M tokens benchmark
            
            setHistory(prev => {
              const newHistory = [...prev];
              newHistory[newHistory.length - 1] = fullText;
              newHistory.push(`---`);
              newHistory.push(`📊 STATS: ${stats.tokens} tokens | ${stats.speed} t/s`);
              newHistory.push(`💰 EST. CLOUD SAVINGS: $${savings}`);
              return newHistory;
            });
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
      <div className="w-full max-w-3xl border-2 border-green-900 rounded-lg bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)]">
        <div className="bg-green-900/20 px-4 py-2 border-b border-green-900 text-[10px] flex justify-between uppercase tracking-widest">
          <span>KANYE_OS // CORE_2026</span>
          <span className={gpuStats.temp > 75 ? "text-red-500 animate-pulse" : "text-green-400"}>
            TEMP: {gpuStats.temp}°C | VRAM: {gpuStats.vram}GB / 16GB
          </span>
        </div>

        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-3 text-sm scrollbar-hide">
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
    </main>
  );
}