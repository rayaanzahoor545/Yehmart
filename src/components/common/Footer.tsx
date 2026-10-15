import React, { useState } from 'react';
import { Truck, ShieldCheck, RefreshCw, PhoneCall, ArrowRight, Check } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';

interface FooterProps {
  setCurrentView: (view: string) => void;
  setSelectedCategory: (cat: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, setSelectedCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* 4 Pillars of Pakistani Brand Trust */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-stone-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Nationwide COD</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Pay cash at doorstep across all cities and towns in Pakistan via TCS & Leopards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Original</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Custom engineered hardware and precision-milled fabrics with verified authenticity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Easy Exchange</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Hassle-free sizing exchanges and prompt customer care resolutions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-400 shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct WhatsApp Care</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Live Pakistani support agents ready 10am to 10pm PKT: {SITE_CONFIG.supportPhone}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-2xl font-black tracking-tight text-white font-['Syne'] flex items-baseline gap-0.5">
              <span>yehmart</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              An independent modern Pakistani digital storefront. We curate enduring technical audio, horological timepieces, and minimalist architectural wardrobe staples built for daily resilience.
            </p>
            <div className="pt-2">
              <p className="text-xs text-stone-400 font-mono">Headquarters: {SITE_CONFIG.headquarters}</p>
            </div>
          </div>

          {/* Catalog Columns */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Store Catalog</h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('tech-audio');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Tech & Wireless Audio
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('watches');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Automatic Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('mens-wear');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  320 GSM Knitwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('leather-edc');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  MagSafe Wallets & EDC
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('deals')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Flash Sales & Discounts
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => setCurrentView('track-order')} className="hover:text-white transition-colors">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('delivery')} className="hover:text-white transition-colors">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('returns')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">
                  Contact Customer Support
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Stay in the Loop</h5>
            <p className="text-xs text-stone-400 mb-3">
              Receive secret VIP promo codes and access to limited batch product drops.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 text-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you. Use code <strong>WELCOME10</strong> for 10% off!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-stone-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-white text-stone-950 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Logistics & Payment Partners + Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-stone-400 font-medium">Delivery Partners:</span>
          <span>TCS Express</span>
          <span>·</span>
          <span>Leopards Courier</span>
          <span>·</span>
          <span>PostEx Rapid</span>
          <span>·</span>
          <span>Trax Logistics</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('privacy')} className="hover:text-stone-300 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => setCurrentView('terms')} className="hover:text-stone-300 transition-colors">
            Terms of Service
          </button>
          <span>© {new Date().getFullYear()} {SITE_CONFIG.legalName}</span>
        </div>
      </div>
    </footer>
  );
};
