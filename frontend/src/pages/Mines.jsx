import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Bomb, Diamond } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Mines() {
  const [bankroll, setBankroll] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [mines, setMines] = useState(3);
  const [picks, setPicks] = useState(5);
  const [rounds, setRounds] = useState(1000);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    if (picks > (25 - mines)) {
      setError(`With ${mines} mines, you can only pick a maximum of ${25 - mines} safe tiles.`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/simulations/mines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          starting_bankroll: Number(bankroll), 
          bet_amount: Number(betAmount), 
          mine_count: Number(mines),
          target_picks: Number(picks),
          total_rounds: Number(rounds) 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults({ ...data, summary: typeof data.result_summary === 'string' ? JSON.parse(data.result_summary) : data.result_summary });
      } else {
        setError(data.error || 'Failed to run simulation');
      }
    } catch (err) { setError('Connection lost.'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={() => navigate('/simulations')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Laboratory Hub
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Bomb className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mines Matrix Analyzer</h1>
            <p className="text-slate-400">Hypergeometric distribution and algorithmic cash-out strategies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Bot Strategy</h2>
              {error && <div className="mb-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">{error}</div>}

              <form onSubmit={runSimulation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Bankroll ($)</label>
                    <input type="number" min="1" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Bet Size ($)</label>
                    <input type="number" min="1" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Grid Mines</label>
                    <input type="number" min="1" max="24" value={mines} onChange={(e) => setMines(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Picks</label>
                    <input type="number" min="1" max="24" value={picks} onChange={(e) => setPicks(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rounds to Simulate</label>
                  <input type="number" min="1" max="100000" value={rounds} onChange={(e) => setRounds(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500" />
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 px-4 rounded-lg transition-all mt-4 ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                  {loading ? 'Processing Matrix...' : 'Run Simulation'}
                </button>
              </form>
            </div>

            {results && (
              <div className={`border rounded-2xl p-6 shadow-xl ${results.summary.bankrupt ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">Mathematical Output</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Payout Multiplier</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400">{results.summary.multiplier.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Clearance Odds</p>
                    <p className="text-xl font-bold font-mono text-white">
                      {(results.summary.win_probability * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs mb-1">Final Bankroll</p>
                  <p className={`text-xl font-bold font-mono ${results.summary.final_bankroll > bankroll ? 'text-emerald-400' : 'text-rose-400'}`}>${results.summary.final_bankroll.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Wealth Trajectory Line Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6">Strategy Wealth Trajectory</h2>
              {!results ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">Waiting for matrix configuration...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.summary.history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="round" stroke="#64748b" fontSize={12} tickFormatter={(val) => `Rnd ${val}`} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#10b981' }} formatter={(value) => [`$${value}`, 'Bankroll']} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={bankroll} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Baseline', fill: '#64748b', fontSize: 12 }} />
                    <Line type="stepAfter" name="Bankroll ($)" dataKey="bankroll" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Matrix Visualizer (5x5 Grid) */}
            {results && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Sample Matrix Distribution (Visual Reference)</h2>
                <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
                  {results.summary.sample_grid.map((tile, index) => (
                    <div 
                      key={index} 
                      className={`aspect-square rounded-lg flex items-center justify-center border ${
                        tile === 'mine' 
                        ? 'bg-rose-500/10 border-rose-500/30' 
                        : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}
                    >
                      {tile === 'mine' ? <Bomb className="w-5 h-5 text-rose-500" /> : <Diamond className="w-5 h-5 text-emerald-500/50" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}