import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Category } from '../../types';
import { stripHtml } from '../../utils/htmlUtils';

interface CategoryShowcaseProps {
  onSelectCategory: (slug: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const categories = storeService.getCategories();

  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-emerald-800 font-bold font-mono">
              CURATED DEPARTMENTS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 font-['Urbanist','Outfit','Syne',sans-serif] tracking-[-0.03em] mt-1.5">
              Explore Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm font-['Urbanist','Plus_Jakarta_Sans',sans-serif] leading-relaxed">
            Engineered acoustics, mechanical timepieces, and heavy streetwear categorized for intentional everyday living.
          </p>
        </div>

        {/* Asymmetric Bento-style Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const isLarge = index === 0 || index === 3;
            return (
              <div
                key={`cat-showcase-${cat.id}-${index}`}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative overflow-hidden rounded-xl bg-stone-900 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isLarge ? 'sm:col-span-2 lg:col-span-1 h-[320px]' : 'h-[320px]'
                }`}
              >
                {/* Background Photography with Zoom */}
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Dark Vignette Overlay for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

                {/* Content Box */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-stone-950/70 backdrop-blur-md rounded text-[11px] font-mono text-stone-300">
                      0{index + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 -translate-x-1 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-['Syne'] group-hover:text-emerald-300 transition-colors">
                      {stripHtml(cat.name)}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 line-clamp-1">
                      {stripHtml(cat.description || '')}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                      <span>{cat.productCount || 8} Articles</span>
                      <span>·</span>
                      <span>In Stock</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
