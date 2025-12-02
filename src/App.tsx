import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import { useWeb3 } from './hooks/useWeb3';

function App() {
  const { account, signer, connectWallet } = useWeb3();

  return (
    <div className="min-h-screen bg-slate-900">
      <Header account={account} connectWallet={connectWallet} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard signer={signer} account={account} connectWallet={connectWallet} />} 
        />
        <Route 
          path="/admin" 
          element={<AdminPanel signer={signer} account={account} connectWallet={connectWallet} />} 
        />
      </Routes>
    </div>
  );
}

export default App;
