import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, LineChart as ChartIcon, Briefcase, Zap, Shield, Target } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PortfolioSimulator() {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [volatility, setVolatility] = useState(15);
  const [simulations, setSimulations] = useState(1000);
  const [targetWealth, setTargetWealth] = useState(250000);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const applyPreset = (ret, vol) => {
    setExpectedReturn(ret);
    setVolatility(vol);
  };

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const response = await fetch('http://localhost:5000/api/simulations/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          initial_investment: initialInvestment, 
          monthly_contribution: monthlyContribution, 
          years, 
          expected_return: expectedReturn, 
          volatility, 
          simulations, 
          target_wealth: targetWealth 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Safely extract the JSON whether the DB named it summary_json or result_summary
        const payload = data.summary_json || data.result_summary;
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        setResults(parsed || null);
      } else {
        setError(data.error || 'Failed to process portfolio matrix');
      }
    } catch (err) { 
      setError('Connection lost to quantitative engine.'); 
    } finally { 
      setLoading(false); 
    }
  };

  // Crash-proof currency formatter
  const fmtCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '---';
    return `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
            <ChartIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Quantitative Portfolio Engine</h1>
            <p className="text-slate-400">Map asset trajectories and structural variance using Geometric Brownian Motion.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Risk Profiles</h2>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button type="button" onClick={() => applyPreset(8, 5)} className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition flex flex-col items-center gap-1 text-xs text-slate-300">
                  <Shield className="w-4 h-4 text-blue-400" /> Conservative
                </button>
                <button type="button" onClick={() => applyPreset(12, 15)} className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:border-emerald-500 hover:bg-emerald-500/10 transition flex flex-col items-center gap-1 text-xs text-slate-300">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Index Fund
                </button>
                <button type="button" onClick={() => applyPreset(18, 25)} className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:border-amber-500 hover:bg-amber-500/10 transition flex flex-col items-center gap-1 text-xs text-slate-300">
                  <Target className="w-4 h-4 text-amber-400" /> Aggressive
                </button>
                <button type="button" onClick={() => applyPreset(25, 50)} className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition flex flex-col items-center gap-1 text-xs text-slate-300">
                  <Zap className="w-4 h-4 text-purple-400" /> Crypto Style
                </button>
              </div>

              {error && <div className="mb-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{error}</div>}

              <form onSubmit={runSimulation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Initial Cap ($)</label>
                    <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Monthly SIP ($)</label>
                    <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Ann. Return (%)</label>
                    <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Volatility (%)</label>
                    <input type="number" value={volatility} onChange={(e) => setVolatility(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-rose-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Yrs)</label>
                    <input type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Simulations</label>
                    <input type="number" min="100" max="10000" value={simulations} onChange={(e) => setSimulations(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Wealth Goal ($)</label>
                  <input type="number" value={targetWealth} onChange={(e) => setTargetWealth(e.target.value)} className="w-full bg-slate-950 border border-emerald-900 rounded-lg px-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 font-bold" />
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all mt-4 ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Processing Paths...' : 'Execute Monte Carlo'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Mean (Average)</p>
                <p className="text-lg font-bold font-mono text-white">{results?.metrics ? fmtCurrency(results.metrics.mean) : '---'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Median (50th %ile)</p>
                <p className="text-lg font-bold font-mono text-indigo-400">{results?.metrics ? fmtCurrency(results.metrics.median) : '---'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-500 text-xs mb-1 font-medium">Worst Case (Min)</p>
                <p className="text-lg font-bold font-mono text-rose-400">{results?.metrics ? fmtCurrency(results.metrics.worst) : '---'}</p>
              </div>
              <div className={`border p-4 rounded-xl transition-colors ${results ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <p className="text-slate-400 text-xs mb-1 font-medium">Target Hit Prob.</p>
                <p className="text-lg font-bold font-mono text-emerald-400">{results?.metrics?.target_probability != null ? `${results.metrics.target_probability}%` : '---'}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] shadow-xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Asset Growth Trajectories (Best / Median / Worst)</h2>
              {!results?.charts?.timeline ? (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Waiting for trajectory calculation...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.charts.timeline} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ fontFamily: 'monospace' }} formatter={(val) => fmtCurrency(val)} />
                    <Legend />
                    <ReferenceLine y={targetWealth} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Target Goal', fill: '#10b981', fontSize: 11 }} />
                    <Line type="monotone" dataKey="Best" stroke="#10b981" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                    <Line type="monotone" dataKey="Median" stroke="#6366f1" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Worst" stroke="#ef4444" strokeWidth={1} dot={false} strokeOpacity={0.8} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[250px] shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Final Wealth Distribution</h2>
                {results?.metrics && (
                  <div className="flex gap-4 text-xs font-mono text-slate-400">
                    <span>10th %ile: <span className="text-rose-400">{fmtCurrency(results.metrics.p10)}</span></span>
                    <span>90th %ile: <span className="text-emerald-400">{fmtCurrency(results.metrics.p90)}</span></span>
                  </div>
                )}
              </div>
              
              {!results?.charts?.histogram ? (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Waiting for distribution processing...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.charts.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="rangeLabel" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={40} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} formatter={(val) => [val, 'Simulations']} />
                    <Bar dataKey="frequency" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200 leading-relaxed">
              <strong>Understanding Volatility Drag:</strong> Notice the difference between the Mean (Average) and the Median. The <em>Mean</em> is pulled upward by a small number of extremely lucky paths. The <em>Median</em> represents what the typical user actually experiences. High volatility aggressively widens this gap, causing the majority of outcomes to fall below the mathematical average.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}