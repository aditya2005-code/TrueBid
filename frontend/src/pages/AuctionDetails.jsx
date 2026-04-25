import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, TrendingDown, AlertCircle, Award, Activity, Zap } from 'lucide-react';
import { formatDistanceToNow, isPast, format } from 'date-fns';

const API = 'http://localhost:5000';

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

const RankBadge = ({ rank }) => {
  const styles = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-amber-600 text-white',
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${styles[rank] || 'bg-slate-100 text-slate-500'}`}>
      {rank === 1 ? 'L1' : rank === 2 ? 'L2' : rank === 3 ? 'L3' : `#${rank}`}
    </span>
  );
};

const Countdown = ({ bidCloseTime, triggerWindowMinutes }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const close = new Date(bidCloseTime);
  const now = new Date();
  const diffMs = close - now;

  if (diffMs <= 0) return <span className="text-red-600 font-black text-lg">Auction Closed</span>;

  const diffMins = diffMs / 60000;
  const inWindow = diffMins <= triggerWindowMinutes;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);

  return (
    <div className={`rounded-xl p-3 text-center ${inWindow ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-100'}`}>
      <p className={`text-xs font-semibold mb-1 ${inWindow ? 'text-red-500' : 'text-blue-500'}`}>
        {inWindow ? '⚡ Extension Trigger Window Active' : '⏱ Time Remaining'}
      </p>
      <p className={`text-2xl font-black tabular-nums ${inWindow ? 'text-red-600' : 'text-blue-700'}`}>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </p>
    </div>
  );
};

const AuctionDetails = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ supplier_id: '', freight_charges: '', origin_charges: '', destination_charges: '', transit_time: '', quote_validity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setBidError(null);
    setBidSuccess(null);
  };

  const totalAmount = (
    (parseFloat(form.freight_charges) || 0) +
    (parseFloat(form.origin_charges) || 0) +
    (parseFloat(form.destination_charges) || 0)
  ).toFixed(2);

  const fetchAll = useCallback(async () => {
    try {
      const [rfqRes, bidsRes, logsRes] = await Promise.all([
        axios.get(`${API}/api/rfqs/${id}`),
        axios.get(`${API}/api/bids/${id}`),
        axios.get(`${API}/api/rfqs/${id}/logs`),
      ]);
      setRfq(rfqRes.data.data);
      setBids(bidsRes.data.data || []);
      setLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch auction data', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_id || !form.freight_charges) {
      setBidError('Supplier ID and Freight Charges are required');
      return;
    }
    setSubmitting(true);
    setBidError(null);
    setBidSuccess(null);
    try {
      await axios.post(`${API}/api/bids`, {
        rfq_id: parseInt(id),
        supplier_id: parseInt(form.supplier_id),
        freight_charges: parseFloat(form.freight_charges),
        origin_charges: parseFloat(form.origin_charges) || 0,
        destination_charges: parseFloat(form.destination_charges) || 0,
        total_amount: parseFloat(totalAmount),
        transit_time: parseInt(form.transit_time) || 0,
        quote_validity: form.quote_validity || null,
      });
      setBidSuccess('Bid placed successfully!');
      setForm({ supplier_id: '', freight_charges: '', origin_charges: '', destination_charges: '', transit_time: '', quote_validity: '' });
      fetchAll();
    } catch (err) {
      setBidError(err.response?.data?.error || err.response?.data?.details || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading auction...</p>
    </div>
  );

  if (!rfq) return <div className="text-center py-24 text-slate-500">RFQ not found.</div>;

  const isActive = !isPast(new Date(rfq.bid_close_time));

  return (
    <div className="space-y-6">
      {/* Back Nav */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold">
        <ArrowLeft size={16} /> Back to Auctions
      </Link>

      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{rfq.rfq_name}</h2>
          <p className="text-slate-400 font-mono text-sm mt-1">{rfq.reference_id}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {isActive ? <><Zap size={12} className="inline mb-0.5" /> Active</> : 'Closed'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Award className="text-yellow-500 w-5 h-5" />
              <h3 className="font-black text-slate-900">Supplier Leaderboard</h3>
              <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
            </div>
            {bids.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <TrendingDown className="mx-auto mb-3 w-8 h-8" />
                <p className="font-semibold">No bids yet</p>
                <p className="text-sm mt-1">Be the first supplier to place a quote</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Freight</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Origin</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dest.</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transit</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid Till</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bids.map((bid) => (
                    <tr key={bid.id} className={bid.rank === 1 ? 'bg-yellow-50/60' : ''}>
                      <td className="px-5 py-4"><RankBadge rank={bid.rank} /></td>
                      <td className="px-5 py-4 font-semibold text-slate-700">#{bid.supplier_id}</td>
                      <td className="px-5 py-4 text-slate-600">₹{Number(bid.freight_charges).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-600">₹{Number(bid.origin_charges).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-600">₹{Number(bid.destination_charges).toLocaleString()}</td>
                      <td className="px-5 py-4 font-black text-slate-900">₹{Number(bid.total_amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-500">{bid.transit_time}d</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{bid.quote_validity ? format(new Date(bid.quote_validity), 'dd MMM yyyy') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Activity className="text-blue-500 w-5 h-5" />
              <h3 className="font-black text-slate-900">Activity Log</h3>
            </div>
            {logs.length === 0 ? (
              <p className="py-10 text-center text-slate-400 text-sm">No activity yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.event_type === 'EXTENSION' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{log.message}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{format(new Date(log.created_at), 'dd MMM, HH:mm:ss')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT: Auction Info + Bid Form */}
        <div className="space-y-4">
          {/* Countdown */}
          <Countdown bidCloseTime={rfq.bid_close_time} triggerWindowMinutes={rfq.trigger_window_minutes} />

          {/* RFQ Meta */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">Auction Config</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Pickup Date', rfq.pickup_date ? format(new Date(rfq.pickup_date), 'dd MMM yyyy') : '—'],
                ['Forced Close', format(new Date(rfq.forced_close_time), 'dd MMM, HH:mm')],
                ['Trigger Window', `${rfq.trigger_window_minutes} min`],
                ['Extension', `+${rfq.extension_duration_minutes} min`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Place Bid Form */}
          {isActive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4">Place Your Bid</h3>
              <form onSubmit={handleBidSubmit} className="space-y-3">
                {bidError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                    <AlertCircle size={14} /> {bidError}
                  </div>
                )}
                {bidSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2 text-xs font-semibold">
                    ✓ {bidSuccess}
                  </div>
                )}
                <input id="bid-supplier-id" type="number" placeholder="Supplier ID *" className={inputClass} value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)} required />
                <input id="bid-freight" type="number" step="0.01" placeholder="Freight Charges *" className={inputClass} value={form.freight_charges} onChange={e => set('freight_charges', e.target.value)} />
                <input id="bid-origin" type="number" step="0.01" placeholder="Origin Charges" className={inputClass} value={form.origin_charges} onChange={e => set('origin_charges', e.target.value)} />
                <input id="bid-destination" type="number" step="0.01" placeholder="Destination Charges" className={inputClass} value={form.destination_charges} onChange={e => set('destination_charges', e.target.value)} />
                <input id="bid-transit" type="number" placeholder="Transit Time (days)" className={inputClass} value={form.transit_time} onChange={e => set('transit_time', e.target.value)} />
                <input id="bid-validity" type="datetime-local" placeholder="Quote Validity" className={inputClass} value={form.quote_validity} onChange={e => set('quote_validity', e.target.value)} />
                <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Total Amount</span>
                  <span className="text-lg font-black text-slate-900">₹{Number(totalAmount).toLocaleString()}</span>
                </div>
                <button
                  id="place-bid-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
