import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity } from 'lucide-react';

export default function TickerTape() {
  const [messages, setMessages] = useState([
    { id: 1, text: "System initialized. Listening for global matrix executions..." }
  ]);

  useEffect(() => {
    // 1. Connect to the backend WebSocket
    const socket = io('http://localhost:5000');

    // 2. Listen for the 'live_feed' broadcast we added to the backend
    socket.on('live_feed', (data) => {
      const newEvent = {
        id: Date.now(),
        text: `[${data.environment}] ${data.user} ${data.message}`
      };
      
      // Keep only the last 5 events in memory so the browser doesn't lag
      setMessages((prev) => [newEvent, ...prev].slice(0, 5));
    });

    // Cleanup the connection when the user leaves the dashboard
    return () => socket.disconnect();
  }, []);

  return (
    <div className="w-full bg-indigo-950/50 border-b border-indigo-500/20 py-2 overflow-hidden flex items-center relative">
      {/* Static Left Badge */}
      <div className="absolute left-0 bg-indigo-950/90 z-10 px-4 py-1 flex items-center gap-2 border-r border-indigo-500/20 shadow-[10px_0_15px_-3px_rgba(30,27,75,1)]">
        <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest whitespace-nowrap">
          Live Global Feed
        </span>
      </div>
      
      {/* The Scrolling Container */}
      <div className="flex pl-[200px] space-x-12 animate-[ticker_20s_linear_infinite]">
        {messages.map((msg) => (
          <div key={msg.id} className="text-xs font-mono text-slate-300 whitespace-nowrap flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Inline CSS for the infinite scroll animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}