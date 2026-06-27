import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Skull, ShieldAlert, CircleDollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function GamblersRuin() {
  const [bankroll, setBankroll] = useState(100);
  const [target, setTarget] = useState(200);
  const [betSize, setBetSize] = useState(10);
  const [winProb, setWinProb] = useState(47.37); // Default to American Roulette Red/Black
  const [sims, setSims] = useState(2500);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const response = await fetch('http://localhost:5000/api/simulations/gamblers-ruin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          starting_bankroll: bankroll, 
          target_wealth: target, 
          win_probability: winProb,
          bet_size: betSize,
          total_simulations: sims 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const payload = data.summary_json || data.result_summary;
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        setResults(parsed || null);
      } else {
        setError(data.error || 'Failed to process absorbing barriers');
      }
    } catch (err) { 
      setError('Connection lost to quantitative engine.'); 
    } finally { 
      setLoading(false); 
    }
  };

  // Color palette for the random walk lines
  const colors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#38bdf8', '#fb7185', '#a3e635', '#2dd4bf', '#c084fc'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={() => navigate('/simulations')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Laboratory Hub
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Skull className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gambler's Ruin Paradox</h1>
            <p className="text-slate-400">Observe absorbing Markov chains and the mathematical certainty of bankruptcy.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Barrier Configuration</h2>
              {error && <div className="mb-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{error}</div>}

              <form onSubmit={runSimulation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Starting Bankroll ($)</label>
                    <input type="number" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Wealth ($)</label>
                    <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-slate-950 border border-emerald-900 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Bet Size ($)</label>
                    <input type="number" value={betSize} onChange={(e) => setBetSize(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Win Probability (%)</label>
                    <input type="number" step="0.01" value={winProb} onChange={(e) => setWinProb(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Total Simulations</label>
                  <input type="number" max="10000" value={sims} onChange={(e) => setSims(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono" />
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all mt-2 ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Calculating Ruin...' : 'Run Markov Chains'}
                </button>
              </form>
            </div>

            <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-200/80 leading-relaxed">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
                <ShieldAlert className="w-4 h-4" /> The House Edge Trap
              </div>
              When win probability drops even slightly below 50% (like Roulette's 47.37%), the odds of doubling your money before going bankrupt don't drop slightly—they collapse exponentially.
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Empirical Ruin (Bankrupt)</p>
                <p className="text-2xl font-bold font-mono text-rose-400">{results ? `${results.empirical_ruin.toFixed(2)}%` : '---'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Empirical Success (Hit Target)</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">{results ? `${results.empirical_success.toFixed(2)}%` : '---'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Theoretical Math Formula</p>
                <p className="text-lg font-bold font-mono text-slate-300">{results ? `${results.theoretical_success.toFixed(2)}%` : '---'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Avg Steps to Resolution</p>
                <p className="text-lg font-bold font-mono text-indigo-400">{results ? results.avg_steps.toLocaleString() : '---'}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[500px] shadow-xl flex flex-col">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Sample Random Walks (Absorbing Barriers)</h2>
              {!results?.chart_data ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Waiting for trajectory calculation...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.chart_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="step" stroke="#64748b" fontSize={11} tickFormatter={(val) => `Step ${val}`} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, target + (target * 0.1)]} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ fontFamily: 'monospace' }} labelStyle={{ display: 'none' }} />
                    <ReferenceLine y={target} stroke="#10b981" strokeWidth={2} label={{ position: 'top', value: 'Success Barrier (Target)', fill: '#10b981', fontSize: 11 }} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeWidth={2} label={{ position: 'top', value: 'Ruin Barrier (Bankruptcy)', fill: '#ef4444', fontSize: 11 }} />
                    <ReferenceLine y={bankroll} stroke="#64748b" strokeDasharray="3 3" />
                    
                    {/* Render a dynamic line for each sample path tracked by the backend */}
                    {results.paths.map((pathName, index) => (
                      <Line 
                        key={pathName}
                        type="stepAfter" 
                        dataKey={pathName} 
                        stroke={colors[index % colors.length]} 
                        strokeWidth={1.5} 
                        dot={false}
                        strokeOpacity={0.8}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}