import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Clock, PlusCircle } from 'lucide-react';

const AuctionList = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRfqs();
    // Poll for updates every 10 seconds to get dynamic lowest bid updates
    const interval = setInterval(fetchRfqs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRfqs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rfqs');
      setRfqs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching RFQs", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status, bidCloseTime) => {
    if (status === 'FORCE_CLOSED') return 'bg-red-100 text-red-800';
    if (status === 'CLOSED' || isPast(new Date(bidCloseTime))) return 'bg-slate-100 text-slate-800 border-slate-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm';
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading active auctions...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Active Auctions</h2>
        <button className="flex items-center gap-2 bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
          <PlusCircle size={20} />
          New Auction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rfqs.map((rfq) => {
          const isClosed = isPast(new Date(rfq.bid_close_time));
          
          return (
            <Link 
              key={rfq.id} 
              to={`/rfq/${rfq.id}`}
              className="group relative block bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer border border-slate-200 hover:border-transparent"
            >
              {/* Subtle gradient border effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{ padding: '2px' }}>
                <div className="w-full h-full bg-white rounded-[15px]" />
              </div>

              <div className="p-6 relative z-10 bg-white h-full rounded-[15px]">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(rfq.status, rfq.bid_close_time)}`}>
                    {isClosed ? 'Closed' : rfq.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{rfq.reference_id}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {rfq.rfq_name || "Unnamed Logistics Route"}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                  {rfq.description || 'No description provided for this cargo request.'}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-y border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Current Lowest</span>
                    <span className="font-black text-xl text-slate-900">
                      {rfq.current_lowest_bid ? `$${Number(rfq.current_lowest_bid).toLocaleString()}` : <span className="text-slate-400 italic font-normal text-sm bg-slate-50 px-3 py-1 rounded-md">Awaiting bids</span>}
                    </span>
                  </div>

                  <div className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${isClosed ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                    <Clock size={16} className={isClosed ? "" : "text-blue-500 animate-pulse"} />
                    {isClosed ? (
                      <span className="font-medium">Ended {formatDistanceToNow(new Date(rfq.bid_close_time))} ago</span>
                    ) : (
                      <span className="font-bold">Ends in {formatDistanceToNow(new Date(rfq.bid_close_time))}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {rfqs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
             <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No active auctions</h3>
          <p className="text-slate-500">Create a new RFQ to start receiving bids.</p>
        </div>
      )}
    </div>
  );
};

export default AuctionList;
