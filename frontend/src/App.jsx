import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RFQList from './pages/RFQList';
import AuctionDetails from './pages/AuctionDetails';
import CreateRFQModal from './components/CreateRFQModal';

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setShowCreateModal(false);
    setRefreshKey(k => k + 1);
  };

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
            <Route
              path="/"
              element={<RFQList key={refreshKey} onNewAuction={() => setShowCreateModal(true)} />}
            />
            <Route path="/rfq/:id" element={<AuctionDetails />} />
          </Routes>
        </main>

        {showCreateModal && (
          <CreateRFQModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCreated}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
