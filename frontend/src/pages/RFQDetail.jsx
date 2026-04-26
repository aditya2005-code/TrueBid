import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, AlertCircle, Clock, Zap, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Leaderboard from '../components/Leaderboard';
import BidForm from '../components/BidForm';

const API = 'http://localhost:5000';

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

// ── Status Badge ──────────────────────────────────────────────
const getStatus = (rfq) => {
  if (!rfq) return 'ACTIVE';
  const now = new Date();
  if (now > new Date(rfq.forced_close_time)) return 'FORCE_CLOSED';
  if (now > new Date(rfq.bid_close_time)) return 'CLOSED';
  return 'ACTIVE';
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { style: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Zap size={12} className="inline mb-0.5" /> },
    CLOSED: { style: 'bg-slate-100 text-slate-600 border-slate-200', icon: <CheckCircle size={12} className="inline mb-0.5" /> },
    FORCE_CLOSED: { style: 'bg-red-100 text-red-700 border-red-200', icon: <AlertCircle size={12} className="inline mb-0.5" /> },
  };
  const { style, icon } = map[status] || map.ACTIVE;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${style}`}>
      {icon} {status.replace('_', ' ')}
    </span>
  );
};

// ── Live Countdown ────────────────────────────────────────────
const Countdown = ({ bidCloseTime, triggerWindowMinutes }) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const msLeft = new Date(bidCloseTime) - new Date();
  if (msLeft <= 0) return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
      <p className="text-slate-500 font-semibold text-sm">Bidding Closed</p>
    </div>
  );

  const inWindow = msLeft / 60000 <= triggerWindowMinutes;
  const h = Math.floor(msLeft / 3600000);
  const m = Math.floor((msLeft % 3600000) / 60000);
  const s = Math.floor((msLeft % 60000) / 1000);

  return (
    <div className={`rounded-xl p-3 text-center border ${inWindow ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
      <p className={`text-xs font-semibold mb-1 ${inWindow ? 'text-red-500' : 'text-blue-500'}`}>
        {inWindow ? '⚡ Extension Trigger Window Active' : '⏱ Time Remaining'}
      </p>
      <p className={`text-2xl font-black tabular-nums ${inWindow ? 'text-red-600' : 'text-blue-700'}`}>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </p>
    </div>
  );
};

// ── Rank Badge ────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const styles = { 1: 'bg-yellow-400 text-yellow-900', 2: 'bg-slate-300 text-slate-800', 3: 'bg-amber-600 text-white' };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${styles[rank] || 'bg-slate-100 text-slate-500'}`}>
      {rank <= 3 ? `L${rank}` : `#${rank}`}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────
const RFQDetail = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [rfqRes, bidsRes, logsRes] = await Promise.all([
        axios.get(`${API}/api/rfqs/${id}`),
        axios.get(`${API}/api/bids/rfq/${id}`),
        axios.get(`${API}/api/rfqs/${id}/logs`),
      ]);
      setRfq(rfqRes.data.data);
      setBids(bidsRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch RFQ data', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);



  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading auction...</p>
    </div>
  );

  if (!rfq) return <div className="text-center py-24 text-slate-500">RFQ not found.</div>;

  const status = getStatus(rfq);
  const isActive = status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Back Nav */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold">
        <ArrowLeft size={16} /> Back to Auctions
      </Link>

      {/* ── Top: RFQ Info ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900">{rfq.rfq_name}</h2>
              <StatusBadge status={status} />
              {isActive && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-slate-400 font-mono text-sm">{rfq.reference_id}</p>
              <span className="text-[10px] text-slate-300 font-medium italic">
                Last updated: {format(lastUpdated, 'HH:mm:ss')}
              </span>
            </div>
            {rfq.description && <p className="text-slate-500 text-sm mt-2 max-w-xl">{rfq.description}</p>}
          </div>
          <div className="flex flex-col gap-2 text-sm text-right shrink-0">
            <div className="flex items-center justify-end gap-2 text-slate-500">
              <Clock size={14} />
              <span>Closes: <span className="font-semibold text-slate-800">{format(new Date(rfq.bid_close_time), 'dd MMM yyyy, HH:mm')}</span></span>
            </div>
            <div className="flex items-center justify-end gap-2 text-slate-500">
              <AlertCircle size={14} />
              <span>Forced Close: <span className="font-semibold text-red-600">{format(new Date(rfq.forced_close_time), 'dd MMM yyyy, HH:mm')}</span></span>
            </div>
            {rfq.pickup_date && (
              <div className="text-slate-400 text-xs">Pickup: {format(new Date(rfq.pickup_date), 'dd MMM yyyy')}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Grid: Left Leaderboard + Right Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <Leaderboard bids={bids} />
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">
          {/* Countdown */}
          {isActive && <Countdown bidCloseTime={rfq.bid_close_time} triggerWindowMinutes={rfq.trigger_window_minutes} />}

          {/* Auction Config */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-3">Auction Config</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Trigger Window', `${rfq.trigger_window_minutes} min`],
                ['Extension', `+${rfq.extension_duration_minutes} min`],
                ['Forced Close', format(new Date(rfq.forced_close_time), 'HH:mm, dd MMM')],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bid Form */}
          {isActive && (
            <BidForm rfqId={id} onBidPlaced={fetchAll} />
          )}
        </div>
      </div>

      {/* ── Bottom: Activity Log ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity className="text-blue-500 w-5 h-5" />
          <h3 className="font-black text-slate-900">Activity Log</h3>
          <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{logs.length} event{logs.length !== 1 ? 's' : ''}</span>
          <button 
            onClick={fetchAll}
            className="ml-2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
            title="Refresh Data"
          >
            <Activity size={14} />
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="py-12 text-center text-slate-400 text-sm">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  {['Event', 'Message', 'Previous Close', 'New Close', 'Timestamp'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.event_type === 'EXTENSION' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs">{log.message}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {log.previous_end_time ? format(new Date(log.previous_end_time), 'HH:mm:ss') : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {log.new_end_time ? format(new Date(log.new_end_time), 'HH:mm:ss') : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd MMM, HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQDetail;
