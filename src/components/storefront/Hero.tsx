import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Eye,
  Check,
  Volume2,
  VolumeX,
  MapPin,
  Flame,
  Layers,
  Copy,
  Sliders,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SITE_CONFIG, formatPKR } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { storeService } from '../../services/storeService';
import { Product } from '../../types';

interface HeroProps {
  onExploreClick: () => void;
  onDealsClick: () => void;
  onSelectProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface VariantOption {
  id: string;
  name: string;
  colorHex: string;
  image: string;
  specHighlight: string;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}

interface HeroSlide {
  id: string;
  sku: string;
  categoryTag: string;
  title: string;
  highlight: string;
  subtitle: string;
  price: number;
  compareAtPrice: number;
  rating: number;
  reviewsCount: number;
  badge: string;
  stockLeft: number;
  accentGlow: string;
  variants: VariantOption[];
  hotspots: Hotspot[];
  soundDemos?: { mode: string; description: string; db: string }[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    sku: 'YM-AUD-01',
    categoryTag: 'PRECISION WIRELESS ACOUSTICS',
    title: 'AeroPulse Pro',
    highlight: 'ANC Earbuds',
    subtitle: 'Hybrid 42dB active noise cancellation with beryllium diaphragms and aerospace titanium casing.',
    price: 6499,
    compareAtPrice: 8999,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'SAVE 28% TODAY',
    stockLeft: 6,
    accentGlow: 'rgba(16, 185, 129, 0.18)',
    variants: [
      {
        id: 'v-obsidian',
        name: 'Matte Obsidian',
        colorHex: '#18181b',
        image: '/src/assets/images/hero_kavan_showcase_1791062087100.jpg',
        specHighlight: 'Ceramic bead-blasted stealth finish',
      },
      {
        id: 'v-titanium',
        name: 'Aerospace Silver',
        colorHex: '#94a3b8',
        image: '/src/assets/images/cat_tech_audio_1791062105164.jpg',
        specHighlight: 'Brushed natural titanium unibody',
      },
      {
        id: 'v-midnight',
        name: 'Midnight Navy',
        colorHex: '#1e293b',
        image: '/src/assets/images/hero_kavan_showcase_1791062087100.jpg',
        specHighlight: 'Deep anodized navy alloy',
      },
    ],
    hotspots: [
      {
        id: 'h-driver',
        x: 42,
        y: 38,
        label: '11mm Beryllium Diaphragm',
        detail: 'Ultra-fast acoustic transient response with visceral 15Hz sub-bass and zero distortion.',
      },
      {
        id: 'h-anc',
        x: 65,
        y: 28,
        label: 'Dual Anti-Wind ANC Mics',
        detail: '-42dB active cancellation calibrated for loud urban traffic and airport transit.',
      },
      {
        id: 'h-case',
        x: 52,
        y: 76,
        label: 'Titanium Qi Charging Case',
        detail: '38-hour battery longevity with 10-minute USB-C rapid top-up providing 4 hours play.',
      },
    ],
    soundDemos: [
      { mode: 'Studio Pure', description: 'Flat audio curve calibrated for audiophile acoustic precision', db: '94 dB' },
      { mode: 'Sub-Bass Boost', description: 'Deep 15Hz tactile low-end without muddying mid vocals', db: '102 dB' },
      { mode: 'Vocal Clarity', description: 'Forward 1kHz-4kHz curve tailored for Urdu & English podcasts and calls', db: '98 dB' },
    ],
  },
  {
    id: 'slide-2',
    sku: 'YM-WTC-01',
    categoryTag: 'PRECISION HOROLOGY CALIBER',
    title: 'Horizon Automatic',
    highlight: 'Field Watch',
    subtitle: 'Japanese NH35A mechanical movement with scratchproof double-domed sapphire crystal and 316L monobloc steel.',
    price: 18499,
    compareAtPrice: 24999,
    rating: 5.0,
    reviewsCount: 58,
    badge: 'LIMITED HOROLOGY DROP',
    stockLeft: 4,
    accentGlow: 'rgba(245, 158, 11, 0.18)',
    variants: [
      {
        id: 'v-steel',
        name: 'Monobloc 316L Steel',
        colorHex: '#cbd5e1',
        image: '/src/assets/images/cat_watches_acc_1791062139569.jpg',
        specHighlight: 'Surgical stainless steel with satin brushed bevels',
      },
      {
        id: 'v-black',
        name: 'Stealth PVD Matte',
        colorHex: '#09090b',
        image: '/src/assets/images/cat_watches_acc_1791062139569.jpg',
        specHighlight: 'Diamond-like carbon anti-scratch finish',
      },
    ],
    hotspots: [
      {
        id: 'h-sapphire',
        x: 48,
        y: 44,
        label: 'Double-Domed Sapphire',
        detail: 'Mohs hardness 9 scratch-resistant crystal with triple-layer anti-reflective coating.',
      },
      {
        id: 'h-caliber',
        x: 68,
        y: 62,
        label: 'NH35A 24-Jewel Caliber',
        detail: 'Automatic self-winding mechanical engine with 41-hour reserve and hacking seconds.',
      },
      {
        id: 'h-strap',
        x: 32,
        y: 80,
        label: 'Horween Top-Grain Strap',
        detail: 'Hand-burnished full-grain leather strap with quick-release spring bars.',
      },
    ],
  },
  {
    id: 'slide-3',
    sku: 'YM-APP-01',
    categoryTag: 'ARCHITECTURAL TEXTILES',
    title: '320 GSM Minimal',
    highlight: 'French Terry Hoodie',
    subtitle: '100% custom-milled combed Pakistani long-staple cotton in relaxed boxy drop-shoulder cut.',
    price: 4999,
    compareAtPrice: 6500,
    rating: 4.8,
    reviewsCount: 112,
    badge: 'BESTSELLING MENSWEAR',
    stockLeft: 8,
    accentGlow: 'rgba(59, 130, 246, 0.18)',
    variants: [
      {
        id: 'v-charcoal',
        name: 'Heavy Charcoal',
        colorHex: '#334155',
        image: '/src/assets/images/cat_mens_fashion_1791062123518.jpg',
        specHighlight: 'Pre-shrunk 320 GSM ring-spun French Terry',
      },
      {
        id: 'v-sand',
        name: 'Raw Stone Melange',
        colorHex: '#d6d3d1',
        image: '/src/assets/images/cat_mens_fashion_1791062123518.jpg',
        specHighlight: 'Unbleached natural yarn with structured hood',
      },
    ],
    hotspots: [
      {
        id: 'h-cotton',
        x: 52,
        y: 46,
        label: '320 GSM Pakistani Combed Yarn',
        detail: 'Heavyweight loopback interior without synthetic fleece shedding. Lasts 500+ washes.',
      },
      {
        id: 'h-hood',
        x: 48,
        y: 22,
        label: 'Double-Lined Structured Hood',
        detail: 'Engineered crossover collar that holds rigid sculptural shape without drawstrings.',
      },
    ],
  },
  {
    id: 'slide-4',
    sku: 'YM-EDC-01',
    categoryTag: 'TITANIUM EVERYDAY CARRY',
    title: 'Apex Magnetic Cardholder',
    highlight: '& Key Organiser',
    subtitle: 'Forged carbon fiber RFID-blocking card chassis with aerospace grade 5 titanium tension plate.',
    price: 3499,
    compareAtPrice: 4800,
    rating: 4.9,
    reviewsCount: 76,
    badge: 'NEW LAUNCH DROP',
    stockLeft: 5,
    accentGlow: 'rgba(217, 119, 6, 0.18)',
    variants: [
      {
        id: 'v-carbon',
        name: 'Forged Carbon',
        colorHex: '#27272a',
        image: '/src/assets/images/hero_luxury_wallet_1791110433137.jpg',
        specHighlight: 'Ultra-light forged carbon weave with RFID shield',
      },
      {
        id: 'v-raw-titanium',
        name: 'Titanium Grade 5',
        colorHex: '#64748b',
        image: '/src/assets/images/hero_luxury_wallet_1791110433137.jpg',
        specHighlight: 'Precision CNC-milled satin alloy plate',
      },
    ],
    hotspots: [
      {
        id: 'h-rfid',
        x: 45,
        y: 52,
        label: 'RFID Wireless Shielding',
        detail: 'Blocks 13.56 MHz contactless skimming frequencies to protect Pakistani bank cards.',
      },
      {
        id: 'h-clip',
        x: 70,
        y: 40,
        label: 'Titanium Money Tension Clip',
        detail: 'Holds up to 25 Pakistani Rupee banknotes firmly without mechanical fatigue.',
      },
    ],
  },
];

const PAKISTANI_CITIES_ETA: { city: string; eta: string; courier: string }[] = [
  { city: 'Lahore', eta: 'Next Day Delivery (24h)', courier: 'TCS Express' },
  { city: 'Karachi', eta: '24-48 Hours Express Air', courier: 'TCS / Leopards' },
  { city: 'Islamabad', eta: 'Next Business Day', courier: 'Leopards' },
  { city: 'Rawalpindi', eta: 'Next Business Day', courier: 'Leopards' },
  { city: 'Faisalabad', eta: '24-48h Doorstep COD', courier: 'PostEx' },
  { city: 'Peshawar', eta: '48h Doorstep COD', courier: 'TCS Express' },
];

const RECENT_CUSTOMER_ACTIVITY = [
  { text: 'Hamza R. in DHA Phase 6, Lahore just ordered AeroPulse Pro', time: '2m ago' },
  { text: 'Dr. Shahmir A. in Clifton, Karachi verified Horizon Automatic', time: '5m ago' },
  { text: 'Bilal T. in F-7 Islamabad received doorstep TCS delivery', time: '9m ago' },
  { text: 'Ayesha M. in Gulberg, Lahore applied code YEHMARTVIP', time: '14m ago' },
];

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onDealsClick,
  onSelectProduct,
  onQuickView,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const allProducts = storeService.getProducts();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(PAKISTANI_CITIES_ETA[0]);
  const [activityIndex, setActivityIndex] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isAuditionPlaying, setIsAuditionPlaying] = useState(false);
  const [selectedSoundDemo, setSelectedSoundDemo] = useState(0);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [showReviewsFlyout, setShowReviewsFlyout] = useState(false);

  // 3D Parallax tilt ref
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });

  const currentSlide = HERO_SLIDES[currentSlideIndex];
  const activeVariant = currentSlide.variants[selectedVariantIndex] || currentSlide.variants[0];

  // Find corresponding product model from service
  const matchedProduct =
    allProducts.find((p) => p.sku === currentSlide.sku || p.name.includes(currentSlide.title)) ||
    allProducts[0];

  // Auto-advance slides every 7 seconds when not hovered
  useEffect(() => {
    if (isHoveringHero) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        setSelectedVariantIndex(0);
        setActiveHotspotId(null);
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [isHoveringHero]);

  // Rotate customer live activity every 4.5 seconds
  useEffect(() => {
    const actTimer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % RECENT_CUSTOMER_ACTIVITY.length);
    }, 4500);
    return () => clearInterval(actTimer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setSelectedVariantIndex(0);
    setActiveHotspotId(null);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setSelectedVariantIndex(0);
    setActiveHotspotId(null);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
    setSelectedVariantIndex(0);
    setActiveHotspotId(null);
  };

  // 3D Mouse Parallax calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -9; // Tilt up/down
    const rotateY = ((x - centerX) / centerX) * 9; // Tilt left/right
    setCardRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
    setActiveHotspotId(null);
  };

  // Instant Add to Bag Directly from Hero with Confetti
  const handleDirectAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!matchedProduct) return;

    // Pick matching variant or first variant
    const targetVariant = matchedProduct.variants?.find((v) =>
      v.name.toLowerCase().includes(activeVariant.name.toLowerCase())
    ) || matchedProduct.variants?.[0];

    const success = addToCart(matchedProduct, targetVariant, 1);
    if (success) {
      setIsAddedFeedback(true);
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.75, x: 0.65 },
          colors: ['#10b981', '#f59e0b', '#ffffff'],
        });
      } catch (err) {
        // Safe fallback
      }
      setTimeout(() => {
        setIsAddedFeedback(false);
        setIsCartOpen(true);
      }, 700);
    }
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('YEHMARTVIP');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  return (
    <div
      className="relative bg-stone-950 text-white overflow-hidden border-b border-stone-800 select-none"
      onMouseEnter={() => setIsHoveringHero(true)}
      onMouseLeave={() => setIsHoveringHero(false)}
    >
      {/* Background luxury ambient atmospheric glow */}
      <div
        className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: currentSlide.accentGlow }}
      />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16 relative z-10">
        {/* Top Floating Utility Ribbon: Live Order Pings & Instant Voucher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-800/80 mb-8 sm:mb-10 text-xs">
          {/* Animated Customer Activity Stream */}
          <div className="flex items-center gap-2 text-stone-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
              LIVE NATIONWIDE DISPATCH:
            </span>
            <span className="text-stone-300 text-[11px] font-normal transition-opacity duration-300 truncate max-w-xs sm:max-w-md">
              {RECENT_CUSTOMER_ACTIVITY[activityIndex].text}
            </span>
            <span className="text-stone-500 text-[10px] hidden md:inline">
              ({RECENT_CUSTOMER_ACTIVITY[activityIndex].time})
            </span>
          </div>

          {/* Interactive VIP Coupon Pill */}
          <button
            onClick={handleCopyCoupon}
            className="group flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 hover:border-amber-400 transition-all text-[11px] font-mono shadow-xs hover:shadow-amber-500/10"
            title="Click to copy code"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>VIP Code:</span>
            <span className="font-bold tracking-wider text-white">YEHMARTVIP</span>
            <span className="text-amber-400 font-bold">(-15%)</span>
            {copiedCoupon ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold pl-1">
                <Check className="w-3 h-3" />
                <span>COPIED!</span>
              </span>
            ) : (
              <Copy className="w-3 h-3 text-stone-400 group-hover:text-amber-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Hero 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Narrative Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category Tag & Scarcity Indicator */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full glass-luxury text-[10px] font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
                {currentSlide.categoryTag}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-semibold">
                <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                <span>Only {currentSlide.stockLeft} Available Today</span>
              </span>
              <span className="text-stone-500 text-xs hidden sm:inline">·</span>
              <span className="text-stone-400 text-xs font-mono hidden sm:inline">
                {currentSlide.badge}
              </span>
            </div>

            {/* Dynamic Animated Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] font-['Urbanist','Outfit','Syne',sans-serif] leading-[1.03] text-white">
                {currentSlide.title} <br />
                <span className="gold-gradient-text drop-shadow-sm">
                  {currentSlide.highlight}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-stone-300/90 max-w-xl leading-relaxed font-normal font-['Urbanist','Plus_Jakarta_Sans',sans-serif]">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Interactive Colorway / Material Customizer */}
            <div className="p-4 rounded-2xl glass-luxury-card border border-stone-800/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 uppercase font-mono tracking-wider text-[11px]">
                    Selected Finish:
                  </span>
                  <span className="font-bold text-white font-mono">{activeVariant.name}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {activeVariant.specHighlight}
                </span>
              </div>

              {/* Swatch Buttons */}
              <div className="flex items-center gap-2.5">
                {currentSlide.variants.map((v, vIdx) => {
                  const isSelected = selectedVariantIndex === vIdx;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(vIdx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-white bg-white/10 text-white shadow-md shadow-white/5 scale-105'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price, Discount & Customer Rating Capsule */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {formatPKR(currentSlide.price)}
                </span>
                <span className="text-base font-mono text-stone-500 line-through">
                  {formatPKR(currentSlide.compareAtPrice)}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  SAVE {formatPKR(currentSlide.compareAtPrice - currentSlide.price)}
                </span>
              </div>

              <div className="h-6 w-px bg-stone-800 hidden sm:block" />

              {/* Interactive Reviews Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowReviewsFlyout(!showReviewsFlyout)}
                  className="flex items-center gap-1.5 text-xs p-1.5 rounded-lg hover:bg-stone-900/80 transition-colors group cursor-pointer"
                  title="Click to view verified customer ratings"
                >
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-bold text-white font-mono">{currentSlide.rating}</span>
                  <span className="text-stone-400 underline decoration-dotted group-hover:text-amber-300">
                    ({currentSlide.reviewsCount} verified reviews)
                  </span>
                </button>

                {/* Reviews Flyout Tooltip */}
                {showReviewsFlyout && (
                  <div className="absolute left-0 top-full mt-2 w-72 p-3.5 rounded-xl glass-luxury border border-stone-700 shadow-2xl z-30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-b border-stone-800 pb-1.5">
                      <span>CUSTOMER SATISFACTION</span>
                      <span className="text-emerald-400 font-bold">99.4% POSITIVE</span>
                    </div>
                    <p className="text-stone-300 italic text-[11px]">
                      "Ordered to Gulberg Lahore. Arrived next day via TCS with parcel pre-inspection. Packaging and acoustic clarity is genuine luxury standard."
                    </p>
                    <div className="text-[10px] font-mono text-stone-400 flex justify-between">
                      <span>Kamran S. (Lahore)</span>
                      <span className="text-amber-400 font-bold">5.0 ★ COD Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive City Transit & COD Inspection Selector */}
            <div className="p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose Delivery Destination:</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  Open Parcel Before Payment
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {PAKISTANI_CITIES_ETA.map((c) => (
                  <button
                    key={c.city}
                    onClick={() => setSelectedCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      selectedCity.city === c.city
                        ? 'bg-stone-100 text-stone-950 font-bold shadow-xs'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {c.city}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-stone-300 flex items-center justify-between pt-1 border-t border-stone-800/60">
                <span className="text-stone-400">
                  Estimated Delivery for <strong className="text-white">{selectedCity.city}</strong>:
                </span>
                <span className="text-emerald-400 font-bold">
                  {selectedCity.eta} ({selectedCity.courier})
                </span>
              </div>
            </div>

            {/* Primary Action Buttons (Instant Bag + Quick View + Explore) */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Direct Quick Add to Cart with Confetti */}
              <button
                onClick={handleDirectAddToBag}
                className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 flex items-center gap-2.5 shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 fill-stone-950" />
                    <span>QUICK BAG (COD)</span>
                  </>
                )}
              </button>

              {/* Quick View Modal Trigger */}
              {onQuickView && matchedProduct && (
                <button
                  onClick={() => onQuickView(matchedProduct)}
                  className="px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:border-stone-500 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-stone-400" />
                  <span>360° QUICK VIEW</span>
                </button>
              )}

              {/* Inspect Full Article */}
              {onSelectProduct && matchedProduct && (
                <button
                  onClick={() => onSelectProduct(matchedProduct)}
                  className="px-5 py-3.5 bg-transparent hover:bg-white/5 text-stone-300 hover:text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Full Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Optional Customer Audio Equalizer Demo (For Audio items) */}
            {currentSlide.soundDemos && (
              <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAuditionPlaying(!isAuditionPlaying)}
                    className={`p-2 rounded-lg transition-colors ${
                      isAuditionPlaying
                        ? 'bg-emerald-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:text-white'
                    }`}
                    title="Toggle acoustic simulation"
                  >
                    {isAuditionPlaying ? (
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                      ACOUSTIC TUNING AUDITION
                    </span>
                    <span className="text-stone-300 text-[11px]">
                      {currentSlide.soundDemos[selectedSoundDemo].description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {currentSlide.soundDemos.map((demo, dIdx) => (
                    <button
                      key={demo.mode}
                      onClick={() => {
                        setSelectedSoundDemo(dIdx);
                        setIsAuditionPlaying(true);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                        selectedSoundDemo === dIdx
                          ? 'bg-white text-stone-950 font-bold'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {demo.mode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Showcase Card with 3D Mouse Tilt & Interactive Hotspots (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative mx-auto max-w-md lg:max-w-none group transition-transform duration-200 ease-out"
              style={{
                perspective: '1000px',
                transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
              }}
            >
              {/* Outer decorative ambient glow border */}
              <div
                className="absolute -inset-1.5 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-700"
                style={{ backgroundColor: currentSlide.accentGlow }}
              />

              {/* Main Product Card */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl">
                {/* Product Image */}
                <div className="relative aspect-4/3 sm:aspect-square bg-stone-950 overflow-hidden">
                  <img
                    key={`${currentSlide.id}-${activeVariant.id}`}
                    src={activeVariant.image}
                    alt={`${currentSlide.title} - ${activeVariant.name}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />

                  {/* Dark subtle vignette for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent pointer-events-none" />

                  {/* Specular Light Sheen follow */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${
                        cardRotation.y * 5 + 50
                      }% ${cardRotation.x * -5 + 50}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                    }}
                  />

                  {/* Top-Right Badge */}
                  <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700/80 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider shadow-lg">
                      100% Original
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-900/90 text-stone-400 text-[10px] font-mono border border-stone-800">
                      COD Doorstep Pre-Check
                    </span>
                  </div>

                  {/* Interactive Hotspots Beacons */}
                  {currentSlide.hotspots.map((hotspot) => {
                    const isHotspotActive = activeHotspotId === hotspot.id;
                    return (
                      <div
                        key={hotspot.id}
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      >
                        <button
                          onClick={() =>
                            setActiveHotspotId(isHotspotActive ? null : hotspot.id)
                          }
                          className="relative flex h-8 w-8 items-center justify-center focus:outline-none cursor-pointer group/pin"
                          aria-label={`Inspect ${hotspot.label}`}
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span
                            className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[10px] font-mono font-black border transition-all ${
                              isHotspotActive
                                ? 'bg-amber-400 text-stone-950 border-amber-300 scale-125 shadow-lg shadow-amber-500/50'
                                : 'bg-stone-950/90 text-white border-emerald-400 shadow-md'
                            }`}
                          >
                            +
                          </span>
                        </button>

                        {/* Hotspot Floating Spec Tooltip */}
                        {isHotspotActive && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl glass-luxury border border-stone-700 shadow-2xl text-left z-30 animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                              ENGINEERING BENCHMARK
                            </span>
                            <h5 className="text-xs font-bold text-white mt-0.5">
                              {hotspot.label}
                            </h5>
                            <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                              {hotspot.detail}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floating Bottom Card Strip */}
                <div className="p-4 bg-stone-950/95 border-t border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                        {currentSlide.badge}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {currentSlide.title} · <span className="text-stone-400 font-normal">{activeVariant.name}</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Cash on Delivery Available Across Pakistan
                    </p>
                  </div>

                  <button
                    onClick={handleDirectAddToBag}
                    className="p-3 bg-white text-stone-950 rounded-xl hover:bg-stone-200 transition-all hover:scale-105 shrink-0 shadow-md cursor-pointer"
                    aria-label="Add to bag"
                    title="Add directly to cart"
                  >
                    <ShoppingBag className="w-4 h-4 fill-stone-950" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Story-Style Slide Tabs with Live Progress Timers */}
        <div className="mt-12 pt-8 border-t border-stone-800/80">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
              FLAGSHIP ATELIER DROPS (0{currentSlideIndex + 1} / 0{HERO_SLIDES.length})
            </span>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Interactive Slide Tab Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {HERO_SLIDES.map((slide, sIdx) => {
              const isActive = currentSlideIndex === sIdx;
              return (
                <div
                  key={slide.id}
                  onClick={() => handleSelectSlide(sIdx)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-stone-900 border-stone-700 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Progress Timer Bar for Active Slide */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all ease-linear"
                        style={{
                          width: isHoveringHero ? '100%' : '100%',
                          animation: isHoveringHero ? 'none' : 'shimmer 7s linear infinite',
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <img
                      src={slide.variants[0].image}
                      alt={slide.title}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block truncate">
                        0{sIdx + 1} · {slide.highlight}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate font-['Urbanist']">
                        {slide.title}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-emerald-400">
                        {formatPKR(slide.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kinetic Marquee Hallmarks Ticker */}
      <div className="bg-stone-900 border-t border-stone-800 py-3 overflow-hidden select-none">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee text-xs font-mono tracking-widest uppercase text-stone-400">
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> YEHMART OFFICIAL DIGITAL STOREFRONT
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> NATIONWIDE CASH ON DELIVERY
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> 24-48 HOUR EXPRESS DISPATCH (TCS & LEOPARDS)
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> 100% AUTHENTIC LUXURY ARCHITECTURE
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> 7-DAY ZERO-FRICTION DOORSTEP EXCHANGE
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> OVER 28,400 SATISFIED PAKISTANI BUYERS
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> LAHORE HQ CONCIERGE CARE (+92 300 8492026)
          </span>
          <span className="text-stone-700">/</span>
          {/* Duplicate loop for seamless continuity */}
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> YEHMART OFFICIAL DIGITAL STOREFRONT
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> NATIONWIDE CASH ON DELIVERY
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> 24-48 HOUR EXPRESS DISPATCH (TCS & LEOPARDS)
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> 100% AUTHENTIC LUXURY ARCHITECTURE
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> 7-DAY ZERO-FRICTION DOORSTEP EXCHANGE
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">★</span> OVER 28,400 SATISFIED PAKISTANI BUYERS
          </span>
          <span className="text-stone-700">/</span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> LAHORE HQ CONCIERGE CARE (+92 300 8492026)
          </span>
        </div>
      </div>
    </div>
  );
};
