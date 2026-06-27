import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Disc } from 'lucide-react';

export default function Roulette() {
  const [bankroll, setBankroll] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [betType, setBetType] = useState('Color');
  const [trials, setTrials] = useState(100);
  
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
      const response = await fetch('https://prob-lab.onrender.com/api/simulations/roulette', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          starting_bankroll: Number(bankroll),
          bet_amount: Number(betAmount),
          bet_type: betType,
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
        setError(data.error || 'Failed to run simulation');
      }
    } catch (err) {
      setError('Connection to server lost.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Disc className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Roulette Wealth Simulator</h1>
            <p className="text-slate-400">Analyzing Risk of Ruin and Expected Value</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Betting Strategy</h2>
              
              {error && <div className="mb-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{error}</div>}

              <form onSubmit={runSimulation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Starting Bankroll ($)</label>
                  <input type="number" min="1" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bet Size ($)</label>
                  <input type="number" min="1" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bet Type</label>
                  <select value={betType} onChange={(e) => setBetType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <optgroup label="Outside Bets (Lower Risk)">
                      <option value="Color">Red/Black (Pays 1:1)</option>
                      <option value="Even/Odd">Even/Odd (Pays 1:1)</option>
                      <option value="High/Low">High/Low (1-18 or 19-36) (Pays 1:1)</option>
                      <option value="Dozen">Dozen (12 numbers) (Pays 2:1)</option>
                      <option value="Column">Column (12 numbers) (Pays 2:1)</option>
                    </optgroup>
                    <optgroup label="Inside Bets (Higher Risk)">
                      <option value="Corner">Corner (4 numbers) (Pays 8:1)</option>
                      <option value="Split">Split (2 numbers) (Pays 17:1)</option>
                      <option value="Single Number">Single Number (Pays 35:1)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Number of Spins</label>
                  <input type="number" min="1" max="100000" value={trials} onChange={(e) => setTrials(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono" />
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 mt-2 ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Simulating...' : 'Run Simulation'}
                </button>
              </form>
            </div>

            {/* Results Data Cards */}
            {results && (
              <div className={`border rounded-2xl p-6 ${results.summary.bankrupt ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <h3 className="text-sm uppercase tracking-wider text-slate-500 mb-4 font-semibold">Post-Simulation Report</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Final Bankroll</p>
                    <p className={`text-2xl font-bold font-mono ${results.summary.final_bankroll > bankroll ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${results.summary.final_bankroll.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Expected Value / Bet</p>
                    <p className="text-xl font-bold font-mono text-amber-400">
                      ${Number(results.expected_value).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-4 text-sm">
                  <span className="text-slate-400">Wins: <span className="text-white font-mono">{results.summary.wins}</span></span>
                  <span className="text-slate-400">Losses: <span className="text-white font-mono">{results.summary.losses}</span></span>
                </div>

                {results.summary.bankrupt && (
                  <div className="mt-4 text-center bg-rose-500/20 text-rose-400 py-2 rounded font-bold uppercase tracking-widest text-sm border border-rose-500/20">
                    Bankrupt
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[600px] flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-6">Wealth Trajectory over Time</h2>
              
              {!results ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Enter parameters to simulate wealth trajectory.</p>
                </div>
              ) : (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.summary.history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="round" stroke="#64748b" fontSize={12} tickFormatter={(val) => `Spin ${val}`} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(value) => [`$${value}`, 'Bankroll']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      
                      {/* Zero line (Bankruptcy) */}
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                      
                      {/* Starting Bankroll line to see profit/loss clearly */}
                      <ReferenceLine y={bankroll} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Starting Point', fill: '#64748b', fontSize: 12 }} />
                      
                      <Line 
                        type="stepAfter"
                        name="Bankroll ($)"
                        dataKey="bankroll" 
                        stroke="#10b981"
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