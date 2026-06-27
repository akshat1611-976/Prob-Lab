import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, Disc, Calculator , Spade, GitMerge,Bomb, LineChart ,Skull } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function SimulationsHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Navbar />
      
      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Simulation Laboratory</h1>
          <p className="text-slate-400 mt-2">Select an environment to initialize a Monte Carlo simulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          

          {/* Roulette Card */}
          <div 
            onClick={() => navigate('/simulations/roulette')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Disc className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Roulette Analyzer</h2>
            <p className="text-sm text-slate-400">Simulate wealth trajectory, bankruptcy risk, and real-world casino combination bets.</p>
          </div>

          {/* Custom Sandbox Card */}
          <div 
            onClick={() => navigate('/simulations/custom')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <Calculator className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Quantitative Sandbox</h2>
            <p className="text-sm text-slate-400">Plug in custom probabilities, win sizes, and risk variables to trace generalized portfolios.</p>
          </div>

          {/* Plinko Card */}
          <div 
            onClick={() => navigate('/simulations/plinko')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/20 hover:border-fuchsia-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-fuchsia-500/20 transition-colors">
              <GitMerge className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Plinko Probability</h2>
            <p className="text-sm text-slate-400">Visualize the binomial distribution and normal curve via thousands of physics drops.</p>
          </div>

          {/* Mines Card */}
          <div 
            onClick={() => navigate('/simulations/mines')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/20 hover:border-rose-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-rose-500/20 transition-colors">
              <Bomb className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Mines Matrix</h2>
            <p className="text-sm text-slate-400">Calculate hypergeometric distributions and simulate aggressive multi-pick grid strategies.</p>
          </div>

          {/* Portfolio Monte Carlo Card */}
          <div 
            onClick={() => navigate('/simulations/portfolio')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <LineChart className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Portfolio Variance Lab</h2>
            <p className="text-sm text-slate-400">Map long-term portfolio growth curves and calculate exact target wealth probabilities using Geometric Brownian Motion loops.</p>
          </div>

          {/* Gambler's Ruin Card */}
          <div 
            onClick={() => navigate('/simulations/gamblers-ruin')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/20 hover:border-rose-500/50"
          >
            <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:bg-rose-500/20 transition-colors">
              <Skull className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Gambler's Ruin</h2>
            <p className="text-sm text-slate-400">Observe absorbing Markov chains and calculate the absolute mathematical certainty of bankruptcy against an infinite bankroll.</p>
          </div>
        </div>
      </main>
    </div>
  );
}