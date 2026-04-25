import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingDown, AlertCircle, CheckCircle, Zap, PlusCircle } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

const API = 'http://localhost:5000';

const getStatus = (rfq) => {
  const now = new Date();
  if (isPast(new Date(rfq.forced_close_time))) return 'FORCE_CLOSED';
  if (isPast(new Date(rfq.bid_close_time))) return 'CLOSED';
  return 'ACTIVE';
};

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    FORCE_CLOSED: 'bg-red-100 text-red-700 border-red-200',
  };
  const icons = {
    ACTIVE: <Zap size={12} className="inline mb-0.5" />,
    CLOSED: <CheckCircle size={12} className="inline mb-0.5" />,
    FORCE_CLOSED: <AlertCircle size={12} className="inline mb-0.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${styles[status]}`}>
      {icons[status]} {status.replace('_', ' ')}
    </span>
  );
};

const RFQList = ({ onNewAuction }) => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRfqs = async () => {
    try {
      const res = await axios.get(`${API}/api/rfqs`);
      setRfqs(res.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load auctions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
    const interval = setInterval(fetchRfqs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading auctions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="text-red-400 w-10 h-10" />
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Live Auctions</h2>
          <p className="text-slate-500 mt-1 text-sm">{rfqs.length} RFQ{rfqs.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          id="new-auction-btn"
          onClick={onNewAuction}
          className="flex items-center gap-2 bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle size={18} />
          New Auction
        </button>
      </div>

      {/* Empty State */}
      {rfqs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No auctions yet</h3>
          <p className="text-slate-500 mb-6">Create your first RFQ to start receiving bids.</p>
          <button onClick={onNewAuction} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
            <PlusCircle size={18} /> Create RFQ
          </button>
        </div>
      )}

      {/* Table */}
      {rfqs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">RFQ</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Lowest Bid</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Bid Close</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Forced Close</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfqs.map((rfq) => {
                const status = getStatus(rfq);
                const isActive = status === 'ACTIVE';
                const bidClose = new Date(rfq.bid_close_time);
                const forcedClose = new Date(rfq.forced_close_time);

                return (
                  <tr
                    key={rfq.id}
                    id={`rfq-row-${rfq.id}`}
                    onClick={() => navigate(`/rfq/${rfq.id}`)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{rfq.rfq_name}</p>
                      <p className="text-slate-400 text-xs mt-0.5 font-mono">{rfq.reference_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      {rfq.current_lowest_bid ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-black text-base">
                          <TrendingDown size={16} /> ₹{Number(rfq.current_lowest_bid).toLocaleString()}
                        </span>
                      ) : (
                        <span className="italic text-slate-400 text-xs bg-slate-50 px-2 py-1 rounded-md">Awaiting bids</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p className="font-medium">{bidClose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-slate-400">{bidClose.toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p className="font-medium">{forcedClose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-slate-400">{forcedClose.toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={status} />
                      {isActive && (
                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock size={11} /> Ends {formatDistanceToNow(bidClose, { addSuffix: true })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-blue-500 font-semibold text-xs group-hover:underline">View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RFQList;
