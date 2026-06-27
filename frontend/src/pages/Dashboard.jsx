import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import TickerTape from '../components/TickerTape';
export default function Dashboard() {
  const [stats, setStats] = useState({
    total_simulations: 0,
    primary_focus: "Loading...",
    recent_runs: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed fetching dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Date formatter for the ledger
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />
      <TickerTape />
      <main className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
            <p className="text-slate-400 mt-1">Aggregate laboratory statistics and recent execution logs.</p>
          </div>
          <button 
            onClick={() => navigate('/simulations')} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            Open Laboratory Hub
          </button>
        </div>

        {/* Top Section: The Two Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-5">
            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Lifetime Runs</p>
              <h3 className="text-3xl font-bold text-white font-mono mt-1">
                {loading ? '---' : stats.total_simulations.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Most Tested Environment</p>
              <h3 className="text-xl font-bold text-white mt-1 truncate max-w-[200px]">
                {loading ? '---' : stats.primary_focus}
              </h3>
            </div>
          </div>

        </div>

        {/* Bottom Section: Execution Audit Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Execution Audit Ledger (Last 5 Runs)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Environment</th>
                  <th className="px-6 py-4 font-medium">System Status</th>
                  <th className="px-6 py-4 font-medium text-right">Net Delta (PnL)</th>
                  <th className="px-6 py-4 font-medium text-right">Primary Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Retrieving system logs...</td>
                  </tr>
                ) : stats.recent_runs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No simulations have been executed yet.</td>
                  </tr>
                ) : (
                  stats.recent_runs.map((run, index) => (
                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {formatDate(run.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {run.type}
                      </td>
                      <td className="px-6 py-4">
                        {run.type === "Gambler's Ruin" || run.type === "Portfolio Variance" ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                             Macro Node
                           </span>
                        ) : run.bankrupt ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ShieldAlert className="w-3.5 h-3.5" /> Bankrupt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-medium ${run.deltaStr === 'Macro Eval' ? 'text-slate-500' : run.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {run.deltaStr}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">
                        {run.primaryMetric}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}