import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RFQList from './pages/RFQList';
import RFQDetail from './pages/RFQDetail';
import CreateRFQ from './pages/CreateRFQ';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tight text-blue-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg text-sm">T</span>
              TrueBid <span className="text-slate-400 font-medium">Auctions</span>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<RFQList />} />
            <Route path="/create" element={<CreateRFQ />} />
            <Route path="/rfq/:id" element={<RFQDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
