import React from 'react';
import { Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  account: string | null;
  connectWallet: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ account, connectWallet }) => {
  const location = useLocation();
  
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-xl">C</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CryptoBank
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-semibold transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin" 
            className={`text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Admin
          </Link>
        </nav>

        <button 
          onClick={connectWallet}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-slate-900 px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-gold-500/20 cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          {account ? formatAddress(account) : 'Connect MetaMask'}
        </button>
      </div>
    </header>
  );
};

export default Header;
