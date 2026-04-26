import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tight text-blue-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg text-sm">T</span>
          TrueBid <span className="text-slate-400 font-medium">Auctions</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
              isActive('/') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home size={16} />
            Home
          </Link>
          <Link 
            to="/auctions" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
              isActive('/auctions') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid size={16} />
            Live Auctions
          </Link>
          <Link 
            to="/create" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
              isActive('/create') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle size={16} />
            New RFQ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs hover:border-blue-500 transition-colors cursor-pointer">
            AS
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
