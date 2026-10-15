import React from 'react';
import { Truck, ShieldCheck, RefreshCw, MessageSquare, Award, Clock, CheckCircle2, Zap } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-stone-950 text-white border-b border-stone-800 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-luxury text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NATIONWIDE COMMERCE GUARANTEE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Urbanist','Syne',sans-serif] tracking-[-0.03em]">
            Built on Unconditional Pakistani Trust.
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-normal leading-relaxed">
            Every order is dispatched from our Lahore fulfillment hub under strict quality inspection. Open your parcel before paying the courier rider.
          </p>
        </div>

        {/* 4 Interactive Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group p-6 rounded-2xl glass-luxury-card border border-stone-800/90 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-base font-bold text-white font-['Urbanist']">
                  Express COD Dispatch
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                24 to 48-hour delivery across Karachi, Lahore, Islamabad, and nationwide via premier TCS & Leopards couriers.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-400">Dispatch Speed</span>
              <span className="text-emerald-400 font-bold">24-48 Hours</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group p-6 rounded-2xl glass-luxury-card border border-stone-800/90 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-base font-bold text-white font-['Urbanist']">
                  Doorstep Inspection
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Inspect physical seals and merchandise packaging before handing cash over to the courier. Zero scam risk.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-400">Verification</span>
              <span className="text-amber-400 font-bold">100% Pre-Check</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group p-6 rounded-2xl glass-luxury-card border border-stone-800/90 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-base font-bold text-white font-['Urbanist']">
                  7-Day Doorstep Swap
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Need a different size or article? Our rider picks up from your address with zero restocking or return fees.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-400">Exchange Window</span>
              <span className="text-emerald-400 font-bold">7 Days Doorstep</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group p-6 rounded-2xl glass-luxury-card border border-stone-800/90 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-base font-bold text-white font-['Urbanist']">
                  Direct WhatsApp Care
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Real humans based at our Lahore headquarters assist with order routing, sizing, and queries 10am to 10pm PKT.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-400">Response Speed</span>
              <span className="text-teal-400 font-bold">&lt; 5 Minutes</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-12 p-6 rounded-2xl bg-stone-900/60 border border-stone-800/90 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">28,400+</div>
            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mt-1">Orders Dispatched</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">99.4%</div>
            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mt-1">On-Time Courier Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">4.92 / 5.0</div>
            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mt-1">Verified Buyer Score</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">100%</div>
            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mt-1">Authentic Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
};
