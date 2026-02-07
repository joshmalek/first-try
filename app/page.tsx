"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function KanyeOS() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM ONLINE...', 'GPU: RTX 5070 Ti 16GB DETECTED']);
  const [isThinking, setIsThinking] = useState(false);
  const [gpuStats, setGpuStats] = useState({ temp: 0, vram: 0 });
  const [sessionSavings, setSessionSavings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  
  // NEW: Model Switcher States
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("deepseek-coder-v2:lite");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch available models from your PC
  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models'); 
      const data = await res.json();
      if (data.models) {
        setModels(data.models.map((m: any) => m.name));
      }
    } catch (e) {
      console.error("Models offline");
    }
  };

  useEffect(() => {
    fetchModels();
    const statsInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setGpuStats(data);
      } catch (e) {}
    }, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    
    if (prompt.toLowerCase() === 'clear') { 
      setHistory(['REBOOTED...', 'REFRESHING_MODELS...']); 
      fetchModels();
      return setInput('');
    }

    // Include the model name in the terminal history for that "pro" look
    setHistory(prev => [...prev, `➜ [${selectedModel}]: ${prompt}`, `[5070_TI_OUTPUT]:`, ""]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        body: JSON.stringify({ 
          prompt, 
          model: selectedModel // <--- Pass the selected model to the backend
        }) 
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (reader) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("__STATS__")) {
          const [textBeforeTag, tagPart] = chunk.split("__STATS__");
          fullText += textBeforeTag; 
          const statsMatch = tagPart.match(/({.*?})/);
          if (statsMatch) {
            const stats = JSON.parse(statsMatch[1]);
            const cloudPrice = (stats.tokens / 1000000 * 15.00);
            const electricityTax = 0.0005; 
            setSessionSavings(prev => prev + (cloudPrice - electricityTax));
            setTotalTokens(prev => prev + stats.tokens);
            
            setHistory(prev => {
              const newHistory = [...prev];
              newHistory[newHistory.length - 1] = fullText;
              newHistory.push("-------------------");
              return newHistory;
            });
          }
          break;
        }

        fullText += chunk;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = fullText;
          return newHistory;
        });

        if (done) break;
      }
    } catch (err) {
      setHistory(prev => [...prev, "!! ERROR: GPU DISCONNECTED !!"]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-green-500 p-4">
      <div className="w-full max-w-3xl border-2 border-green-900 rounded-lg bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)]">
        
        {/* Header with Model Switcher */}
        <div className="bg-green-900/20 px-4 py-2 border-b border-green-900 text-[10px] flex justify-between items-center uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-green-800">MODEL:</span>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-green-400 outline-none border-none cursor-pointer hover:text-white transition-colors"
            >
              {models.length > 0 ? (
                models.map(m => <option key={m} value={m} className="bg-black">{m}</option>)
              ) : (
                <option>LOADING...</option>
              )}
            </select>
          </div>
          <span className={gpuStats.temp > 75 ? "text-red-500 animate-pulse" : "text-green-400"}>
            TEMP: {gpuStats.temp}°C | VRAM: {gpuStats.vram}GB / 16GB
          </span>
        </div>

        <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-3 text-sm scrollbar-hide text-green-400/90">
          {history.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
          {isThinking && <div className="animate-pulse">{" >> PROCESSING_ON_5070TI..."}</div>}
        </div>

        <form onSubmit={handleCommand} className="p-4 border-t border-green-900 flex">
          <span className="mr-3 text-green-400 font-bold">➜</span>
          <input 
            autoFocus className="bg-transparent outline-none w-full text-green-400 placeholder:text-green-900"
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="AWAITING COMMAND..."
          />
        </form>
      </div>

      {/* Financial Dashboard */}
      <div className="w-full max-w-3xl mt-4 grid grid-cols-3 gap-4 text-[10px] uppercase tracking-widest">
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800 mb-1">Session Tokens</div>
          <div className="text-lg font-bold text-green-400">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800 mb-1">Cloud Equivalent</div>
          <div className="text-lg font-bold text-green-400">
            ${(totalTokens / 1000000 * 15.00).toFixed(4)}
          </div>
        </div>
        <div className="border border-green-500/20 p-3 bg-green-500/10 rounded shadow-[0_0_10px_rgba(34,197,94,0.05)]">
          <div className="text-green-400 mb-1 font-bold italic underline">Total Net Savings</div>
          <div className="text-lg font-bold text-white">${sessionSavings.toFixed(4)}</div>
        </div>
      </div>
    </main>
  );
}