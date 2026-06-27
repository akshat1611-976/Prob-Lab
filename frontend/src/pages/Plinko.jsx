import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts';
import { ArrowLeft, GitMerge } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Plinko() {
  const [bankroll, setBankroll] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [balls, setBalls] = useState(1000);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const multipliers = [29, 4, 1.5, 0.3, 0.1, 0.3, 1.5, 4, 29];

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const response = await fetch('http://localhost:5000/api/simulations/plinko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ starting_bankroll: Number(bankroll), bet_amount: Number(betAmount), total_balls: Number(balls) }),
      });

      if (response.ok) {
        const data = await response.json();
        const summary = typeof data.result_summary === 'string' ? JSON.parse(data.result_summary) : data.result_summary;
        
        // Transform the raw bins array into an object for the Recharts BarChart
        const chartData = summary.bins.map((count, index) => ({
          bin: `[${multipliers[index]}x]`,
          count: count,
          multiplier: multipliers[index]
        }));

        setResults({ ...data, summary, chartData });
      }
    } catch (err) { console.error("Plinko Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={() => navigate('/simulations')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Laboratory Hub
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <GitMerge className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Plinko Distribution Engine</h1>
            <p className="text-slate-400">Observing Binomial Probabilities and the Galton Board Bell Curve.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Drop Configuration</h2>
              
              <form onSubmit={runSimulation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Starting Bankroll ($)</label>
                  <input type="number" min="1" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cost per Drop ($)</label>
                  <input type="number" min="1" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Balls to Drop</label>
                  <input type="number" min="1" max="100000" value={balls} onChange={(e) => setBalls(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all mt-4 ${loading ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Simulating Physics...' : 'Release Balls'}
                </button>
              </form>
            </div>

            {results && (
              <div className={`border rounded-2xl p-6 shadow-xl ${results.summary.bankrupt ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Final Bankroll</p>
                    <p className={`text-xl font-bold font-mono ${results.summary.final_bankroll > bankroll ? 'text-emerald-400' : 'text-rose-400'}`}>${results.summary.final_bankroll.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Profit/Loss</p>
                    <p className="text-xl font-bold font-mono text-white">${(results.summary.final_bankroll - bankroll).toFixed(2)}</p>
                  </div>
                </div>
                {results.summary.bankrupt && <div className="text-center bg-rose-500/20 text-rose-400 py-2 rounded font-bold uppercase text-xs border border-rose-500/20">Bankrupt</div>}
              </div>
            )}
          </div>

          {/* Visualization Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Histogram (Bell Curve) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[350px] flex flex-col shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-2">Binomial Distribution (Landing Slots)</h2>
              {!results ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Waiting for ball deployment...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <XAxis dataKey="bin" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {results.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.multiplier < 1 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Wealth Trajectory Line */}
            {results && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[250px] shadow-xl">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.summary.history}>
                    <XAxis dataKey="round" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <ReferenceLine y={bankroll} stroke="#64748b" strokeDasharray="3 3" />
                    <Line type="stepAfter" dataKey="bankroll" stroke="#818cf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}