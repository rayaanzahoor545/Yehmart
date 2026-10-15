import React from 'react';
import { ArrowRight, Sparkles, Flame, Award, Zap, ShieldCheck, CheckCircle2, Feather, Compass, Layers, Clock, Star } from 'lucide-react';
import { Hero } from '../components/storefront/Hero';
import { CategoryShowcase } from '../components/storefront/CategoryShowcase';
import { InteractiveExperienceSection } from '../components/storefront/InteractiveExperienceSection';
import { FlashSaleSection } from '../components/storefront/FlashSaleSection';
import { BudgetCollections } from '../components/storefront/BudgetCollections';
import { TrustSection } from '../components/storefront/TrustSection';
import { ProductCard } from '../components/storefront/ProductCard';
import { storeService } from '../services/storeService';
import { Product } from '../types';

interface HomeViewProps {
  onSelectProduct: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectCategory: (slug: string) => void;
  onExploreShop: () => void;
  onViewDeals: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectProduct,
  onQuickView,
  onSelectCategory,
  onExploreShop,
  onViewDeals,
}) => {
  const allProducts = storeService.getProducts();
  const activeProducts = allProducts.filter((p) => p.isPublished !== false);
  const featuredProducts = activeProducts.filter((p) => p.isFeatured).slice(0, 4);
  const bestSellers = activeProducts.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <div className="bg-white selection:bg-stone-950 selection:text-white">
      {/* 1. International Ultra-Premium Hero Section with Live Slides & Kinetic Marquee */}
      <Hero onExploreClick={onExploreShop} onDealsClick={onViewDeals} />

      {/* 2. Curated Flagship Departments (Asymmetric Luxury Bento) */}
      <CategoryShowcase onSelectCategory={onSelectCategory} />

      {/* 3. Interactive Flagship Engineering & Material Explorer (Interactive Audio/Watch/Apparel Hotspots) */}
      <InteractiveExperienceSection
        onSelectProduct={onSelectProduct}
        onExploreShop={onExploreShop}
      />

      {/* 4. Dynamic Live Flash Sale Drops with Real-Time Countdown */}
      <FlashSaleSection
        onSelectProduct={onSelectProduct}
        onQuickView={onQuickView}
      />

      {/* 5. Curated Flagship Articles Showcase */}
      <section className="py-16 sm:py-24 bg-stone-50/70 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-emerald-800 font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>CURATED BY YEHMART ATELIER</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 font-['Urbanist','Outfit',sans-serif] tracking-[-0.03em] mt-1.5">
                Featured Flagship Hardware
              </h2>
            </div>
            <button
              onClick={onExploreShop}
              className="px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-emerald-800 hover:border-emerald-300 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm hover:shadow"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Dynamic Budget Tier Collections */}
      <BudgetCollections
        onSelectProduct={onSelectProduct}
        onQuickView={onQuickView}
        onExploreMore={onExploreShop}
      />

      {/* 7. Highest Rated Customer Favorites */}
      <section className="py-16 sm:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-amber-800 font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>UNANIMOUS FIVE-STAR REVIEWS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 font-['Urbanist','Outfit',sans-serif] tracking-[-0.03em] mt-1.5">
                Highest Rated Articles
              </h2>
            </div>
            <button
              onClick={onExploreShop}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
            >
              <span>View Full Lineup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. International Nationwide Trust & Fulfillment Guarantee */}
      <TrustSection />
    </div>
  );
};
