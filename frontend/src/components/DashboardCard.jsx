import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function DashboardCard({ title, value, subtitle, data }) {
  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
      
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <p className="text-4xl font-bold text-white mt-2 font-mono tracking-tight">{value}</p>
          <p className="text-emerald-400 text-sm mt-2 font-medium bg-emerald-400/10 inline-block px-2 py-1 rounded-md">
            {subtitle}
          </p>
        </div>
        
        {/* Recharts Mini Graph */}
        <div className="w-24 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="v" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}