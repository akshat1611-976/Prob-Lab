import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Sliders, ShieldAlert, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CustomSandbox() {
  const [name, setName] = useState('Alpha Trading Strategy');
  const [bankroll, setBankroll] = useState(5000);
  const [prob, setProb] = useState(0.40);
  const [reward, setReward] = useState(200);
  const [loss, setLoss] = useState(100);
  const [trials, setTrials] = useState(500);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/simulations/custom', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          experiment_name: name,
          starting_bankroll: Number(bankroll),
          win_probability: Number(prob),
          reward_amount: Number(reward),
          loss_amount: Number(loss),
          total_trials: Number(trials) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const summary = typeof data.result_summary === 'string' 
          ? JSON.parse(data.result_summary) 
          : data.result_summary;
          
        setResults({ ...data, summary });
      } else {
        setError(data.error || 'Failed to process simulation parameters');
      }
    } catch (err) {
      setError('Connection to computational engine lost.');
    } finally {
      setLoading(false);
    }
  };

  // Quick mathematical projection for the input form
  const theoreticalEV = (Number(prob) * Number(reward)) - ((1 - Number(prob)) * Number(loss));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={() => navigate('/simulations')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Laboratory Hub
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Sliders className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Quantitative Risk Sandbox</h1>
            <p className="text-slate-400">Model arbitrary probabilistic systems and asset trajectory paths</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">System Parameters</h2>
              {error && <div className="mb-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{error}</div>}

              <form onSubmit={runSimulation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Model / Experiment Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Initial Capital ($)</label>
                    <input type="number" min="1" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Win Probability</label>
                    <input type="number" step="0.01" min="0" max="1" value={prob} onChange={(e) => setProb(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono" />
                    <span className="text-[10px] text-slate-500">Value between 0.0 - 1.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Payout on Win ($)</label>
                    <input type="number" min="0" value={reward} onChange={(e) => setReward(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Cost on Loss ($)</label>
                    <input type="number" min="0" value={loss} onChange={(e) => setLoss(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Total Loop Iterations</label>
                  <input type="number" min="1" max="100000" value={trials} onChange={(e) => setTrials(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 font-mono" />
                </div>

                {/* Mathematical Edge Predictor Indicator */}
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${theoreticalEV >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  {theoreticalEV >= 0 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  Static Edge Proj: {theoreticalEV >= 0 ? `+ $${theoreticalEV.toFixed(2)} EV` : `- $${Math.abs(theoreticalEV).toFixed(2)} EV`} per step
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Processing Array...' : 'Execute Sandbox Model'}
                </button>
              </form>
            </div>

            {/* Metrics Output Panel */}
            {results && (
              <div className={`border rounded-2xl p-6 shadow-xl bg-slate-900 border-slate-800`}>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">Simulation Diagnostics</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Terminal Value</p>
                    <p className={`text-2xl font-bold font-mono ${results.summary.final_bankroll > bankroll ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${results.summary.final_bankroll.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Success Margin</p>
                    <p className="text-xl font-bold font-mono text-white">
                      {((results.summary.wins / (results.summary.wins + results.summary.losses)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
                  <span>Success events: {results.summary.wins}</span>
                  <span>Failure events: {results.summary.losses}</span>
                </div>

                {results.summary.bankrupt && (
                  <div className="mt-4 text-center bg-rose-500/20 text-rose-400 py-2 rounded font-bold uppercase tracking-widest text-xs border border-rose-500/20">
                    Portfolio Exhausted (Bankruptcy)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[580px] flex flex-col shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6">Monte Carlo Capital Distribution Curve</h2>
              
              {!results ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Initialize system parameters to run variance distribution model.</p>
                </div>
              ) : (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.summary.history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="round" stroke="#64748b" fontSize={12} tickFormatter={(val) => `Step ${val}`} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#818cf8' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(value) => [`$${value}`, 'Capital Base']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                      <ReferenceLine y={bankroll} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Baseline Asset Value', fill: '#64748b', fontSize: 12 }} />
                      <Line 
                        type="monotone" 
                        name="Capital Value ($)"
                        dataKey="bankroll" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}