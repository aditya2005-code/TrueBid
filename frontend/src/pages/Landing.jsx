import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ShieldCheck, Zap, ArrowRight, BarChart3, Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="space-y-24 pb-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px]" />
        </div>

        <div className="text-center space-y-8 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-black uppercase tracking-widest animate-bounce">
            <Zap size={14} />
            Next-Gen RFQ Management
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            The Ultimate <span className="text-blue-600">British Auction</span> Platform for Global Logistics.
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Revolutionize your procurement with real-time bidding, automated extensions, and L1 transparency. Secure the best rates with data-driven auctions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/auctions" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              Explore Live Auctions
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/create" 
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-blue-500 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              Launch New RFQ
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck className="text-emerald-500" />, title: "Secure Bidding", desc: "Military-grade encryption for all supplier quotes and sensitive data." },
          { icon: <BarChart3 className="text-blue-500" />, title: "Live Analytics", desc: "Real-time leaderboard and ranking changes with sub-second updates." },
          { icon: <Globe className="text-orange-500" />, title: "Global Reach", desc: "Connect with verified logistics providers across all major trade lanes." }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{feat.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* How it Works / Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-slate-900 rounded-[48px] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L100,0 L100,100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'rgb(59,130,246)', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'rgb(16,185,129)', stopOpacity:1}} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              Dynamic Time Extensions. <br />
              No Last-Minute Snipping.
            </h2>
            <div className="space-y-6">
              {[
                { title: "Trigger Window (X)", desc: "Set a monitoring window where any new L1 bid extends the auction deadline automatically." },
                { title: "Extension Duration (Y)", desc: "Flexible time bumps that ensure every supplier has a fair chance to counter." },
                { title: "Forced Close Deadlines", desc: "Maintain strict operations with hard cut-off times that never move." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 mt-1 flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                  <div>
                    <h4 className="font-black text-white mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
             <div className="aspect-video rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                <Gavel size={64} className="text-blue-500 animate-pulse" />
             </div>
             <div className="mt-8 space-y-4">
                <div className="h-4 bg-white/10 rounded-full w-3/4" />
                <div className="h-4 bg-white/10 rounded-full w-1/2" />
                <div className="h-4 bg-white/5 rounded-full w-2/3" />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20">
        <h2 className="text-4xl font-black text-slate-900 mb-8">Ready to streamline your freight RFQs?</h2>
        <Link 
          to="/create" 
          className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-lg transition-all shadow-2xl shadow-blue-200"
        >
          Get Started for Free
          <ArrowRight />
        </Link>
      </section>
    </div>
  );
};

export default Landing;
