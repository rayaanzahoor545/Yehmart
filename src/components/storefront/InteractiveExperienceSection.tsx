import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Volume2,
  Watch,
  Shirt,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Truck,
  RotateCcw,
  Star,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { formatPKR, SITE_CONFIG } from '../../config/site';
import { storeService } from '../../services/storeService';
import { Product } from '../../types';

interface InteractiveExperienceSectionProps {
  onSelectProduct: (product: Product) => void;
  onExploreShop: () => void;
}

type FlagshipTab = 'audio' | 'horology' | 'apparel';

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  desc: string;
  spec: string;
}

export const InteractiveExperienceSection: React.FC<InteractiveExperienceSectionProps> = ({
  onSelectProduct,
  onExploreShop,
}) => {
  const [activeTab, setActiveTab] = useState<FlagshipTab>('audio');
  const [selectedHotspot, setSelectedHotspot] = useState<string>('driver');
  const [selectedCity, setSelectedCity] = useState<string>('Lahore');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(true);

  const products = storeService.getProducts();
  const aeroPulse = products.find((p) => p.sku === 'YM-AUD-01') || products[0];
  const horizonWatch = products.find((p) => p.sku === 'YM-WTC-01') || products[1] || products[0];
  const frenchTerryHoodie = products.find((p) => p.sku === 'YM-APP-01') || products[2] || products[0];

  // Hotspots per tab
  const audioHotspots: Hotspot[] = [
    {
      id: 'driver',
      x: 35,
      y: 42,
      title: '11mm Beryllium Driver',
      desc: 'Precision acoustic membrane producing ultra-low harmonic distortion (<0.04%) and visceral 15Hz sub-bass.',
      spec: '15Hz - 44.1kHz Hi-Res Certified',
    },
    {
      id: 'anc',
      x: 68,
      y: 30,
      title: 'Hybrid 42dB Dual-Mic ANC',
      desc: 'Anti-wind acoustic geometry that cancels ambient traffic noise across Pakistani transit and work hubs.',
      spec: '-42dB Active Cancelation',
    },
    {
      id: 'casing',
      x: 52,
      y: 78,
      title: 'Matte Titanium Alloy Body',
      desc: 'Aircraft-grade titanium unibody with ceramic bead-blasted finish for sweat and drop resilience.',
      spec: 'IPX5 Sweat & Water Resistant',
    },
  ];

  const horologyHotspots: Hotspot[] = [
    {
      id: 'movement',
      x: 50,
      y: 48,
      title: 'Japanese NH35A Automatic',
      desc: '24-jewel self-winding mechanical caliber with 41-hour power reserve and 21,600 bph balance beat.',
      spec: 'Mechanical Self-Winding · 24 Jewels',
    },
    {
      id: 'crystal',
      x: 32,
      y: 35,
      title: 'Double-Domed Sapphire Crystal',
      desc: 'Mohs hardness 9 scratch-resistant crystal with triple-layer anti-reflective inner coating.',
      spec: 'Mohs 9 Hardness · Anti-Glare',
    },
    {
      id: 'steel',
      x: 68,
      y: 65,
      title: '316L Surgical Stainless Steel',
      desc: 'Forged solid monobloc case tested to 100 meters (10 ATM) waterproof with screw-down crown.',
      spec: '100m Water Sealed · 316L Monobloc',
    },
  ];

  const apparelHotspots: Hotspot[] = [
    {
      id: 'cotton',
      x: 48,
      y: 40,
      title: '320 GSM Ring-Spun Cotton',
      desc: 'Long-staple Pakistani combed cotton with zero polyester filler. Heavy drape that holds structure over years.',
      spec: '100% Combed Pakistani Cotton',
    },
    {
      id: 'hood',
      x: 48,
      y: 20,
      title: 'Double-Lined Structured Hood',
      desc: 'Crossover collar with heavyweight ribbed lining that stands upright without collapsing.',
      spec: 'Double Interlock Ribbed Finish',
    },
    {
      id: 'seams',
      x: 65,
      y: 60,
      title: 'Cover-Stitched Flatlock Seams',
      desc: 'Reinforced industrial four-thread lockstitch engineered against fraying during repeated laundry cycles.',
      spec: 'Zero Shrinkage Pre-Washed',
    },
  ];

  const currentHotspots =
    activeTab === 'audio'
      ? audioHotspots
      : activeTab === 'horology'
      ? horologyHotspots
      : apparelHotspots;

  const activeProduct =
    activeTab === 'audio'
      ? aeroPulse
      : activeTab === 'horology'
      ? horizonWatch
      : frenchTerryHoodie;

  const currentHotspotData =
    currentHotspots.find((h) => h.id === selectedHotspot) || currentHotspots[0];

  const cityETAMap: Record<string, string> = {
    Lahore: 'Guaranteed 24-Hour Dispatch · Next Day Delivery',
    Karachi: 'Express Air Dispatch · 24-48 Hours via TCS',
    Islamabad: 'Next Business Day Delivery via Leopards',
    Rawalpindi: 'Next Business Day Delivery via Leopards',
    Faisalabad: '24-48 Hours Express Courier Transit',
    Peshawar: '48 Hours Doorstep Delivery with Parcel Inspection',
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('YEHMARTVIP');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <section className="relative py-16 sm:py-24 luxury-mesh-bg text-white overflow-hidden border-b border-stone-800">
      {/* Dynamic ambient blur flares */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-luxury text-[11px] font-mono tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>THE YEHMART LABORATORY & ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-['Urbanist','Syne',sans-serif] tracking-[-0.03em] leading-tight text-white">
              Engineered Beyond Standard. <br />
              <span className="gold-gradient-text">Interactive Material Explorer.</span>
            </h2>
          </div>

          {/* Interactive Domain Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 glass-luxury rounded-2xl border border-stone-800 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedHotspot('driver');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audio'
                  ? 'bg-white text-stone-950 shadow-lg'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Acoustics</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('horology');
                setSelectedHotspot('movement');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'horology'
                  ? 'bg-white text-stone-950 shadow-lg'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Watch className="w-4 h-4" />
              <span>Horology</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('apparel');
                setSelectedHotspot('cotton');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'apparel'
                  ? 'bg-white text-stone-950 shadow-lg'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>320 GSM Knit</span>
            </button>
          </div>
        </div>

        {/* Main Interactive Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Showcase with Interactive Hotspots (7 cols) */}
          <div className="lg:col-span-7 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/90 shadow-2xl h-[400px] sm:h-[480px]">
              <img
                src={activeProduct?.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'}
                alt={activeProduct?.name || 'Featured Product'}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Dark subtle vignette for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40" />

              {/* Clickable Hotspots overlay */}
              {currentHotspots.map((spot, index) => {
                const isSelected = selectedHotspot === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedHotspot(spot.id)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/spot focus:outline-none"
                    aria-label={`Inspect ${spot.title}`}
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isSelected ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center font-mono text-[10px] font-black border transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 border-amber-300 scale-110 shadow-lg shadow-amber-500/50'
                            : 'bg-stone-950/90 text-white border-stone-600 hover:border-emerald-400'
                        }`}
                      >
                        0{index + 1}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Floating Audio Waveform Visualizer Simulation */}
              {activeTab === 'audio' && (
                <div className="absolute top-4 left-4 glass-luxury px-3.5 py-2 rounded-xl flex items-center gap-3 border border-stone-700/60">
                  <div className="flex items-center gap-1 h-5">
                    {[16, 24, 12, 28, 20, 14, 26, 18].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full animate-pulse"
                        style={{
                          height: `${isPlayingAudioSim ? h : 4}px`,
                          animationDelay: `${i * 120}ms`,
                          animationDuration: '800ms',
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] font-mono text-stone-300">
                    <span className="text-emerald-400 font-bold">24-Bit / 96kHz</span> Studio Output
                  </div>
                </div>
              )}

              {/* Floating Bottom Hotspot Quick Bar */}
              <div className="absolute bottom-4 left-4 right-4 glass-luxury p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-4 border border-stone-700/70 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    ACTIVE SPECIFICATION
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white font-['Urbanist']">
                    {currentHotspotData.title}
                  </h4>
                  <p className="text-xs text-stone-400 hidden sm:block">
                    {currentHotspotData.spec}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectProduct(activeProduct)}
                    className="px-4 py-2 bg-white text-stone-950 text-xs font-extrabold rounded-xl hover:bg-stone-200 transition-all flex items-center gap-1.5 shrink-0 shadow-md"
                  >
                    <span>Inspect Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Specification & Trust Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Selected Hotspot Deep Dive Card */}
            <div className="p-6 rounded-3xl glass-luxury-card border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  PRECISION ARCHITECTURE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  VERIFIED BY YEHMART LAB
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white font-['Urbanist'] tracking-tight">
                  {currentHotspotData.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed mt-2">
                  {currentHotspotData.desc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between text-xs font-mono">
                <span className="text-stone-400">Benchmarked Metric:</span>
                <span className="text-amber-300 font-bold">{currentHotspotData.spec}</span>
              </div>

              {/* Product Price & Direct Order Action */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
                <div>
                  <div className="text-[10px] text-stone-500 font-mono">SINGLE PIECE PRICE</div>
                  <div className="text-xl font-black font-mono text-white">
                    {formatPKR(activeProduct?.price || 1499)}
                  </div>
                </div>

                <button
                  onClick={() => onSelectProduct(activeProduct)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>ORDER COD</span>
                </button>
              </div>
            </div>

            {/* Nationwide Transit & Doorstep Inspection Checker */}
            <div className="p-5 rounded-3xl glass-luxury-card border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-300 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Doorstep Inspection & Delivery ETA</span>
                </div>
                <span className="text-[11px] font-mono text-stone-500">TCS & Leopards</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar'].map(
                  (city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedCity === city
                          ? 'bg-stone-100 text-stone-950 font-bold shadow'
                          : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      {city}
                    </button>
                  )
                )}
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">{selectedCity}:</span>{' '}
                  <span>{cityETAMap[selectedCity]}</span>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Zero-advance required · Open parcel & inspect prior to cash handover.
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusive VIP Promo Code Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIP FIRST ORDER BENEFIT</span>
                </div>
                <div className="text-xs text-stone-300 mt-0.5">
                  Apply <span className="font-mono font-bold text-white">YEHMARTVIP</span> for 15% instant discount at checkout.
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Verified Pakistani Client Testimonial Bar */}
        <div className="mt-14 pt-10 border-t border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass-luxury-card border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-stone-400">VERIFIED COD BUYER</span>
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Ordered AeroPulse Pro to DHA Phase 5 Lahore. TCS rider delivered in 22 hours. Tested the ANC immediately—blocks the outdoor generator drone completely."
            </p>
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Hamza K.</span>
              <span className="text-stone-400 font-mono text-[11px]">Lahore, PK</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-luxury-card border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-stone-400">VERIFIED COD BUYER</span>
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "The Horizon Automatic watch has real weight and sapphire clarity. Compared it with my Japanese divers—YehMart's finish is genuine luxury level."
            </p>
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Dr. Shahmir A.</span>
              <span className="text-stone-400 font-mono text-[11px]">Karachi Clifton, PK</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-luxury-card border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-stone-400">VERIFIED COD BUYER</span>
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "320 GSM hoodie is truly thick French Terry cotton, no cheap poly feel. Boxy drop-shoulder cut fits like a bespoke overseas designer piece."
            </p>
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Bilal Tariq</span>
              <span className="text-stone-400 font-mono text-[11px]">Islamabad F-7, PK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
