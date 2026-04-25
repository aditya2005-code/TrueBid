import React from 'react';
import { Award, TrendingDown } from 'lucide-react';

const RankBadge = ({ rank }) => {
  const styles = {
    1: 'bg-yellow-400 text-yellow-900 border-yellow-500',
    2: 'bg-slate-300 text-slate-800 border-slate-400',
    3: 'bg-amber-600 text-white border-amber-700',
  };
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border shadow-sm ${styles[rank] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {rank <= 3 ? `L${rank}` : `#${rank}`}
    </span>
  );
};

const Leaderboard = ({ bids }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Award className="text-yellow-500 w-5 h-5" />
        <h3 className="font-black text-slate-900">Supplier Leaderboard</h3>
        <span className="ml-auto text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
          {bids.length} Bid{bids.length !== 1 ? 's' : ''}
        </span>
      </div>

      {bids.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <TrendingDown className="mx-auto mb-3 w-8 h-8 opacity-20" />
          <p className="font-semibold text-slate-500">No bids placed yet</p>
          <p className="text-sm mt-1">Be the first supplier to submit a quote</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center w-20">Rank</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Supplier</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Total Amount</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Transit Time</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((bid) => (
                <tr
                  key={bid.id}
                  className={`transition-colors ${bid.rank === 1 ? 'bg-yellow-50/40' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-5 py-4 text-center">
                    <RankBadge rank={bid.rank} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">Supplier #{bid.supplier_id}</span>
                      <span className="text-[10px] uppercase tracking-tighter text-slate-400 font-mono">ID: {bid.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-base font-black ${bid.rank === 1 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      ₹{Number(bid.total_amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">
                        {bid.transit_time} Days
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 text-[10px] font-medium">
                      <span className="text-slate-400">F: ₹{Number(bid.freight_charges).toLocaleString()}</span>
                      <span className="text-slate-400">O: ₹{Number(bid.origin_charges).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
