import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuctionList from './pages/AuctionList';
import AuctionDetails from './pages/AuctionDetails';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-blue-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg">T</span>
              TrueBid <span className="text-slate-400 font-medium">Auctions</span>
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<AuctionList />} />
            <Route path="/rfq/:id" element={<AuctionDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
