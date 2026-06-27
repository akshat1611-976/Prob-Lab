import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, FlaskConical, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Destroy the security clearance
    navigate('/login');
  };

  const navClass = (path) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
      location.pathname.startsWith(path) 
      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold text-white tracking-tight">ProbLab</span>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          <Link to="/dashboard" className={navClass('/dashboard')}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/simulations" className={navClass('/simulations')}>
            <FlaskConical className="w-4 h-4" /> Laboratory
          </Link>
        </div>
      </div>

      <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-rose-400 transition-colors text-sm font-medium">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </nav>
  );
}