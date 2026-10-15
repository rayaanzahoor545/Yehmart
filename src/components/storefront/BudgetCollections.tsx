import React, { useState } from 'react';
import { storeService } from '../../services/storeService';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { formatPKR } from '../../config/site';

interface BudgetCollectionsProps {
  onSelectProduct: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onExploreMore: () => void;
}

export const BudgetCollections: React.FC<BudgetCollectionsProps> = ({
  onSelectProduct,
  onQuickView,
  onExploreMore,
}) => {
  const [selectedBudget, setSelectedBudget] = useState<number>(2500);

  const budgets = [
    { label: 'Under Rs. 2,500', maxPrice: 2500 },
    { label: 'Under Rs. 5,000', maxPrice: 5000 },
    { label: 'Under Rs. 10,000', maxPrice: 10000 },
  ];

  const allProducts = storeService.getProducts();
  const filtered = allProducts
    .filter((p) => p.isPublished !== false && p.price <= selectedBudget)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-emerald-800 font-bold font-mono">
              SMART PURCHASING
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 font-['Urbanist','Outfit','Syne',sans-serif] tracking-[-0.03em] mt-1.5">
              Shop By Budget Tier
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-['Urbanist','Plus_Jakarta_Sans',sans-serif]">
              Filter high-performance daily essentials matching your target spending limit.
            </p>
          </div>

          {/* Interactive Segmented Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 rounded-lg">
            {budgets.map((b) => (
              <button
                key={b.maxPrice}
                onClick={() => setSelectedBudget(b.maxPrice)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  selectedBudget === b.maxPrice
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onExploreMore}
            className="px-6 py-2.5 bg-white text-stone-900 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
          >
            Explore Complete Catalog →
          </button>
        </div>
      </div>
    </section>
  );
};
