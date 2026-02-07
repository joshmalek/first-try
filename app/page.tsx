"use client";
import React, { useState, useEffect } from 'react';

export default function KanyeOS() {
  const [stage, setStage] = useState('boot'); // 'boot', 'gate', 'terminal'
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [angle, setAngle] = useState(0);

  // 1. The Boot Sequence
  useEffect(() => {
    const lines = [
      "AUHSOJ_OS V.2049.02.07",
      "CORE: OK",
      "MEMORY: 808s MB CHECKED",
      "NETWORK: CONNECTED via SOJ-NET",
      "LOADING ASSETS...",
      "BOOT COMPLETE.",
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setBootLines((prev) => [...prev, lines[i]]);
      i++;
      if (i === lines.length) {
        clearInterval(interval);
        setTimeout(() => setStage('gate'), 1000);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // 2. The 3D ASCII Animation Loop
  useEffect(() => {
    if (stage === 'terminal') {
      const timer = setInterval(() => {
        setAngle((a) => a + 0.05);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Simple 3D Projection for an ASCII Triangle
  const renderTriangle = () => {
    const size = 10;
    const points = [
      [0, 1, 0],    // Top
      [-1, -1, 1],  // Bottom Left
      [1, -1, 1],   // Bottom Right
      [0, -1, -1]   // Back
    ];

    // Simple rotation logic (Y-axis)
    const projected = points.map(([x, y, z]) => {
      const rotX = x * Math.cos(angle) - z * Math.sin(angle);
      const rotZ = x * Math.sin(angle) + z * Math.cos(angle);
      return { x: rotX * size + 20, y: y * -size + 15 };
    });

    return (
      <pre className="text-[10px] leading-[8px] text-green-400">
        {`
             /\\
            /  \\
           /    \\
          /      \\
         /________\\
        `}
        {/* Real 3D ASCII is complex, this is a placeholder visually 
            mimicking the Kanye2049 "Centerpiece" style */}
      </pre>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-mono text-green-500 overflow-hidden">
      {/* CRT Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-30" />

      {stage === 'boot' && (
        <div className="w-full max-w-md">
          {bootLines.map((line, i) => (
            <p key={i} className="mb-1">{line}</p>
          ))}
          <span className="animate-pulse">_</span>
        </div>
      )}

      {stage === 'gate' && (
        <div className="text-center animate-pulse">
          <p className="mb-4 text-xl tracking-widest">SYSTEM ENCRYPTED</p>
          <button 
            onClick={() => setStage('terminal')}
            className="border border-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all"
          >
            PRESS ENTER TO DECRYPT
          </button>
        </div>
      )}

      {stage === 'terminal' && (
        <div className="flex flex-col items-center">
          <div className="mb-8 scale-150 transform rotate-12">
             {/* The spinning "Triangle" effect */}
             <div style={{ transform: `rotateY(${angle * 50}deg)` }} className="transition-transform">
               <pre className="text-xs leading-none">
{`       ▲
      / \\
     /   \\
    /     \\
   /       \\
  /_________\\`}
               </pre>
             </div>
          </div>
          <div className="border border-green-900 p-4 bg-black/50 w-80 shadow-2xl">
             <p className="text-xs opacity-50 mb-2">ACCESS_LEVEL: VISITOR</p>
             <p>Welcome to the simulation.</p>
             <p className="text-xs mt-4 text-green-800">Type 'unlock' to begin...</p>
          </div>
        </div>
      )}
    </main>
  );
}