import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RFQList from './pages/RFQList';
import RFQDetail from './pages/RFQDetail';
import CreateRFQ from './pages/CreateRFQ';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <Navbar />

        <main className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auctions" element={<RFQList />} />
            <Route path="/create" element={<CreateRFQ />} />
            <Route path="/rfq/:id" element={<RFQDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
