import React, { useState } from 'react';
import axios from 'axios';
import { X, AlertCircle } from 'lucide-react';

const API = 'http://localhost:3000';

const Field = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
  </div>
);

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

const CreateRFQModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    rfq_name: '',
    reference_id: '',
    description: '',
    client_id: '',
    pickup_date: '',
    bid_start_time: '',
    bid_close_time: '',
    forced_close_time: '',
    trigger_window_minutes: 10,
    extension_duration_minutes: 5,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.rfq_name.trim()) e.rfq_name = 'RFQ name is required';
    if (!form.client_id) e.client_id = 'Client ID is required';
    if (!form.pickup_date) e.pickup_date = 'Pickup date is required';
    if (!form.bid_start_time) e.bid_start_time = 'Required';
    if (!form.bid_close_time) e.bid_close_time = 'Required';
    if (!form.forced_close_time) e.forced_close_time = 'Required';

    if (form.bid_start_time && form.bid_close_time && new Date(form.bid_start_time) >= new Date(form.bid_close_time)) {
      e.bid_close_time = 'Must be after Bid Start Time';
    }
    if (form.bid_close_time && form.forced_close_time && new Date(form.bid_close_time) >= new Date(form.forced_close_time)) {
      e.forced_close_time = 'Must be after Bid Close Time';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      await axios.post(`${API}/api/rfqs`, {
        ...form,
        client_id: Number(form.client_id),
        trigger_window_minutes: Number(form.trigger_window_minutes),
        extension_duration_minutes: Number(form.extension_duration_minutes),
      });
      onCreated();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900">Create New Auction</h2>
            <p className="text-slate-500 text-sm mt-0.5">Configure your British Auction RFQ</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="RFQ Name *" error={errors.rfq_name}>
                  <input id="rfq-name" className={inputClass} placeholder="e.g. Mumbai to Delhi Freight" value={form.rfq_name} onChange={e => set('rfq_name', e.target.value)} />
                </Field>
              </div>
              <Field label="Reference ID" error={errors.reference_id}>
                <input id="reference-id" className={inputClass} placeholder="e.g. RFQ-001" value={form.reference_id} onChange={e => set('reference_id', e.target.value)} />
              </Field>
              <Field label="Client ID *" error={errors.client_id}>
                <input id="client-id" type="number" className={inputClass} placeholder="e.g. 101" value={form.client_id} onChange={e => set('client_id', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Description">
                  <textarea id="description" rows={2} className={inputClass + ' resize-none'} placeholder="Details about cargo, route, etc." value={form.description} onChange={e => set('description', e.target.value)} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Pickup / Service Date *" error={errors.pickup_date}>
                  <input id="pickup-date" type="datetime-local" className={inputClass} value={form.pickup_date} onChange={e => set('pickup_date', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>

          {/* Auction Timing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Auction Timing</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Bid Start Time *" error={errors.bid_start_time}>
                <input id="bid-start-time" type="datetime-local" className={inputClass} value={form.bid_start_time} onChange={e => set('bid_start_time', e.target.value)} />
              </Field>
              <Field label="Bid Close Time *" error={errors.bid_close_time}>
                <input id="bid-close-time" type="datetime-local" className={inputClass} value={form.bid_close_time} onChange={e => set('bid_close_time', e.target.value)} />
              </Field>
              <Field label="Forced Close Time *" error={errors.forced_close_time}>
                <input id="forced-close-time" type="datetime-local" className={inputClass} value={form.forced_close_time} onChange={e => set('forced_close_time', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Extension Config */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Extension Config</h3>
            <div className="grid grid-cols-2 gap-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <Field label="Trigger Window (X minutes)">
                <input id="trigger-window" type="number" min={1} className={inputClass} value={form.trigger_window_minutes} onChange={e => set('trigger_window_minutes', e.target.value)} />
              </Field>
              <Field label="Extension Duration (Y minutes)">
                <input id="extension-duration" type="number" min={1} className={inputClass} value={form.extension_duration_minutes} onChange={e => set('extension_duration_minutes', e.target.value)} />
              </Field>
              <p className="col-span-2 text-xs text-blue-600">
                If a bid lands in the last <strong>{form.trigger_window_minutes}min</strong>, close time extends by <strong>{form.extension_duration_minutes}min</strong>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button
              id="submit-rfq-btn"
              type="submit"
              disabled={submitting}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQModal;
