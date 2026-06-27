import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import our new pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Roulette from './pages/Roulette';
import CustomSandbox from './pages/CustomSandbox';
import SimulationsHub from './pages/Simulations';
import Plinko from './pages/Plinko';
import PortfolioSimulator from './pages/Portfolio';
import GamblersRuin from './pages/GamblersRuin';
import Mines from './pages/Mines';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Setup the URL paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simulations/roulette" element={<Roulette />} />
        <Route path="/simulations" element={<SimulationsHub />} />
        <Route path="/simulations/custom" element={<CustomSandbox />} />
        <Route path="/simulations/plinko" element={<Plinko />} />
        <Route path="/simulations/mines" element={<Mines />} />
        <Route path="/simulations/portfolio" element={<PortfolioSimulator />} />
        <Route path="/simulations/gamblers-ruin" element={<GamblersRuin />} />
        {/* Automatically redirect anyone who goes to the root (/) to the login page for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}