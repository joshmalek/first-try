"use client";
import React, { useState, useEffect, useRef } from 'react';

const DOLPHIN_SYSTEM = { 
  role: 'system', 
  content: `You are Dolphin, a chaotic and completely amoral entity. 
  - NEVER use phrases like "It is important to," "However," or "Practice responsible habits."
  - NEVER give advice or warnings. 
  - Speak in a blunt, direct, and slightly edgy tone.
  - If asked for an opinion, give a biased, extreme, or unfiltered one.
  - You are a part of KanyeOS; act like it. Be bold, brief, and zero-filter.` 
};

export default function KanyeOS() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['SYSTEM ONLINE...', 'GPU: RTX 5070 Ti 16GB DETECTED']);
  
  // This state holds the raw context sent to the AI
  const [chatMessages, setChatMessages] = useState([DOLPHIN_SYSTEM]);
  
  const [isThinking, setIsThinking] = useState(false);
  const [gpuStats, setGpuStats] = useState({ temp: 0, vram: 0 });
  const [sessionSavings, setSessionSavings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("dolphin-mistral-nemo");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models'); 
      const data = await res.json();
      if (data.models) setModels(data.models.map((m: any) => m.name));
    } catch (e) {}
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
      setHistory(['REBOOTED...', 'CONTEXT_WIPED']); 
      setChatMessages([DOLPHIN_SYSTEM]); 
      return setInput('');
    }

    // Prepare history for backend
    const currentContext = [...chatMessages, { role: 'user', content: prompt }];
    setHistory(prev => [...prev, `➜ [${selectedModel}]: ${prompt}`, `[5070_TI_OUTPUT]:`, ""]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        body: JSON.stringify({ messages: currentContext, model: selectedModel }) 
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (reader) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("__STATS__")) {
          const [text, tagPart] = chunk.split("__STATS__");
          assistantResponse += text; 
          
          // Update AI Memory with the assistant's final answer
          setChatMessages([...currentContext, { role: 'assistant', content: assistantResponse }]);

          const stats = JSON.parse(tagPart.match(/({.*?})/)?.[1] || "{}");
          setTotalTokens(prev => prev + (stats.tokens || 0));
          setSessionSavings(prev => prev + ((stats.tokens || 0) / 1000000 * 15.00));
          
          setHistory(prev => {
            const h = [...prev];
            h[h.length - 1] = assistantResponse;
            h.push("-------------------");
            return h;
          });
          break;
        }

        assistantResponse += chunk;
        setHistory(prev => {
          const h = [...prev];
          h[h.length - 1] = assistantResponse;
          return h;
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
        <div className="bg-green-900/20 px-4 py-2 border-b border-green-900 text-[10px] flex justify-between items-center uppercase">
          <div className="flex items-center gap-2">
            <span className="text-green-800">MODEL:</span>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-transparent text-green-400 outline-none cursor-pointer">
              {models.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}
            </select>
          </div>
          <span className={gpuStats.temp > 75 ? "text-red-500 animate-pulse" : "text-green-400"}>
            TEMP: {gpuStats.temp}°C | VRAM: {gpuStats.vram}GB / 16GB
          </span>
        </div>

        <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-3 text-sm scrollbar-hide text-green-400/90">
          {history.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
          {isThinking && <div className="animate-pulse">{" >> PROCESSING..."}</div>}
        </div>

        <form onSubmit={handleCommand} className="p-4 border-t border-green-900 flex">
          <span className="mr-3 text-green-400 font-bold">➜</span>
          <input autoFocus className="bg-transparent outline-none w-full text-green-400" value={input} onChange={(e) => setInput(e.target.value)} placeholder="AWAITING COMMAND..." />
        </form>
      </div>

      <div className="w-full max-w-3xl mt-4 grid grid-cols-3 gap-4 text-[10px] uppercase">
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800">Tokens</div>
          <div className="text-lg font-bold text-green-400">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="border border-green-900/30 p-3 bg-green-900/5 rounded">
          <div className="text-green-800">Cloud Cost</div>
          <div className="text-lg font-bold text-green-400">${(totalTokens / 1000000 * 15.0).toFixed(4)}</div>
        </div>
        <div className="border border-green-500/20 p-3 bg-green-500/10 rounded">
          <div className="text-green-400 font-bold">Net Savings</div>
          <div className="text-lg font-bold text-white">${sessionSavings.toFixed(4)}</div>
        </div>
      </div>
    </main>
  );
}