import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Zap } from 'lucide-react';

const API = 'http://localhost:5000';

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400";

const BidForm = ({ rfqId, onBidPlaced }) => {
  const [form, setForm] = useState({
    supplier_id: '',
    freight_charges: '',
    origin_charges: '',
    destination_charges: '',
    transit_time: '',
    quote_validity: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setError(null);
    setSuccess(null);
  };

  const totalAmount = (
    (parseFloat(form.freight_charges) || 0) +
    (parseFloat(form.origin_charges) || 0) +
    (parseFloat(form.destination_charges) || 0)
  ).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_id || !form.freight_charges) {
      setError('Supplier ID and Freight Charges are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API}/api/bids`, {
        rfq_id: parseInt(rfqId),
        supplier_id: parseInt(form.supplier_id),
        freight_charges: parseFloat(form.freight_charges),
        origin_charges: parseFloat(form.origin_charges) || 0,
        destination_charges: parseFloat(form.destination_charges) || 0,
        total_amount: parseFloat(totalAmount),
        transit_time: parseInt(form.transit_time) || 0,
        quote_validity: form.quote_validity || null,
      });

      setSuccess('Bid placed successfully!');
      setForm({
        supplier_id: '',
        freight_charges: '',
        origin_charges: '',
        destination_charges: '',
        transit_time: '',
        quote_validity: '',
      });
      
      if (onBidPlaced) onBidPlaced();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="text-blue-500 w-5 h-5" />
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Submit Your Quote</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-xs font-bold animate-in fade-in slide-in-from-top-1">
            ✓ {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Supplier ID *</label>
            <input 
              id="bid-supplier-id"
              type="number" 
              placeholder="e.g. 505" 
              className={inputClass} 
              value={form.supplier_id} 
              onChange={e => set('supplier_id', e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Freight *</label>
              <input 
                id="bid-freight"
                type="number" 
                step="0.01" 
                placeholder="₹0.00" 
                className={inputClass} 
                value={form.freight_charges} 
                onChange={e => set('freight_charges', e.target.value)} 
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Transit Time (Days) *</label>
              <input 
                id="bid-transit"
                type="number" 
                placeholder="e.g. 3" 
                className={inputClass} 
                value={form.transit_time} 
                onChange={e => set('transit_time', e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Origin Charges</label>
              <input 
                id="bid-origin"
                type="number" 
                step="0.01" 
                className={inputClass} 
                value={form.origin_charges} 
                onChange={e => set('origin_charges', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Dest. Charges</label>
              <input 
                id="bid-destination"
                type="number" 
                step="0.01" 
                className={inputClass} 
                value={form.destination_charges} 
                onChange={e => set('destination_charges', e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Quote Validity</label>
            <input 
              id="bid-validity"
              type="datetime-local" 
              className={inputClass} 
              value={form.quote_validity} 
              onChange={e => set('quote_validity', e.target.value)} 
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-blue-50/50 rounded-2xl px-5 py-4 border border-blue-100/50 my-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Quote Amount</span>
            <span className="text-xl font-black text-blue-900 tracking-tight">₹{Number(totalAmount).toLocaleString()}</span>
          </div>
        </div>

        <button
          id="place-bid-btn"
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting Quote...' : 'Place Official Bid'}
        </button>
      </form>
    </div>
  );
};

export default BidForm;
