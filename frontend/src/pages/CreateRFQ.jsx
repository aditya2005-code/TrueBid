import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Clock, Settings, Info } from 'lucide-react';
import { format } from 'date-fns';

const API = 'http://localhost:5000';

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400";
const labelClass = "block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1";

const CreateRFQ = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rfq_name: '',
    reference_id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    bid_start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    bid_close_time: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"), // Tomorrow
    forced_close_time: format(new Date(Date.now() + 86400000 * 2), "yyyy-MM-dd'T'HH:mm"), // Day after
    trigger_window_minutes: '10',
    extension_duration_minutes: '5',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    const start = new Date(form.bid_start_time);
    const close = new Date(form.bid_close_time);
    const forced = new Date(form.forced_close_time);

    if (close <= start) {
      setError("Bid Close Time must be after Bid Start Time");
      setLoading(false);
      return;
    }
    if (forced <= close) {
      setError("Forced Close Time must be after Bid Close Time");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/api/rfqs`, {
        ...form,
        trigger_window_minutes: parseInt(form.trigger_window_minutes),
        extension_duration_minutes: parseInt(form.extension_duration_minutes),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create RFQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold w-fit">
          <ArrowLeft size={16} /> Back to Auctions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create New <span className="text-blue-600">RFQ</span></h1>
            <p className="text-slate-500 mt-1 font-medium">Configure your British Auction parameters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Info size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800">Basic Information</h2>
            </div>

            <div>
              <label htmlFor="rfq_name" className={labelClass}>RFQ Name *</label>
              <input 
                id="rfq_name"
                name="rfq_name"
                type="text" 
                placeholder="e.g. Q2 Logistics for Northern Region"
                className={inputClass}
                value={form.rfq_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reference_id" className={labelClass}>Reference ID</label>
                <input 
                  id="reference_id"
                  name="reference_id"
                  type="text"
                  className={inputClass}
                  value={form.reference_id}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Description</label>
              <textarea 
                id="description"
                name="description"
                rows="4"
                placeholder="Details about the freight requirements, routes, or special handling..."
                className={`${inputClass} resize-none`}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Time Configuration */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Clock size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800">Timeline & Schedule</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bid_start_time" className={labelClass}>Auction Start Time *</label>
                <input 
                  id="bid_start_time"
                  name="bid_start_time"
                  type="datetime-local"
                  className={inputClass}
                  value={form.bid_start_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="bid_close_time" className={labelClass}>Auction Close Time *</label>
                <input 
                  id="bid_close_time"
                  name="bid_close_time"
                  type="datetime-local"
                  className={inputClass}
                  value={form.bid_close_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="forced_close_time" className={labelClass}>Forced Close Time (Hard Deadline) *</label>
              <input 
                id="forced_close_time"
                name="forced_close_time"
                type="datetime-local"
                className={`${inputClass} border-red-100 bg-red-50/10`}
                value={form.forced_close_time}
                onChange={handleChange}
                required
              />
              <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Extensions will never go beyond this specific time.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Settings size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800">Auction Logic (X/Y)</h2>
            </div>

            <div>
              <label htmlFor="trigger_window_minutes" className={labelClass}>Trigger Window (X mins)</label>
              <div className="relative">
                <input 
                  id="trigger_window_minutes"
                  name="trigger_window_minutes"
                  type="number"
                  className={inputClass}
                  value={form.trigger_window_minutes}
                  onChange={handleChange}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Min</span>
              </div>
            </div>

            <div>
              <label htmlFor="extension_duration_minutes" className={labelClass}>Extension Duration (Y mins)</label>
              <div className="relative">
                <input 
                  id="extension_duration_minutes"
                  name="extension_duration_minutes"
                  type="number"
                  className={inputClass}
                  value={form.extension_duration_minutes}
                  onChange={handleChange}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Min</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-xs flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <button
              id="create-rfq-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Launch Auction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRFQ;
