import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

interface FlashSaleSectionProps {
  onSelectProduct: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  onSelectProduct,
  onQuickView,
}) => {
  const flashSale = storeService.getFlashSale();
  const allProducts = storeService.getProducts();

  const flashProducts = allProducts.filter(
    (p) => p.isPublished !== false && flashSale.productIds.includes(p.id)
  );

  // Dynamic countdown timer based on flashSale.endsAt
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(flashSale.endsAt).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [flashSale.endsAt]);

  if (!flashSale.isActive || flashProducts.length === 0) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-14 sm:py-20 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Live Countdown Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs font-mono uppercase tracking-widest mb-1.5">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>Limited Stock Allocation</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Urbanist','Syne',sans-serif] tracking-[-0.03em]">
              {flashSale.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-md font-['Urbanist','Plus_Jakarta_Sans',sans-serif]">
              {flashSale.subtitle}
            </p>
          </div>

          {/* Dynamic Live Countdown Blocks */}
          <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 p-2.5 rounded-xl">
            <Clock className="w-4 h-4 text-rose-500 mr-1" />
            <div className="flex items-center gap-1.5 text-center">
              <div className="bg-stone-900 px-3 py-1.5 rounded-md min-w-[42px]">
                <span className="text-sm sm:text-base font-bold font-mono text-white">
                  {padZero(timeLeft.hours)}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-stone-500">Hrs</span>
              </div>
              <span className="text-stone-600 font-mono font-bold">:</span>
              <div className="bg-stone-900 px-3 py-1.5 rounded-md min-w-[42px]">
                <span className="text-sm sm:text-base font-bold font-mono text-white">
                  {padZero(timeLeft.minutes)}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-stone-500">Min</span>
              </div>
              <span className="text-stone-600 font-mono font-bold">:</span>
              <div className="bg-stone-900 px-3 py-1.5 rounded-md min-w-[42px]">
                <span className="text-sm sm:text-base font-bold font-mono text-rose-400">
                  {padZero(timeLeft.seconds)}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-stone-500">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
