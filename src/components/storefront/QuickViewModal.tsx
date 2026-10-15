import React, { useState } from 'react';
import { X, Star, ShoppingBag, ArrowRight, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatPKR } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { stripHtml, FALLBACK_PRODUCT_IMAGE } from '../../utils/htmlUtils';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullProduct: (product: Product) => void;
  onInstantCheckout: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullProduct,
  onInstantCheckout,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = selectedVariant?.priceOverride ?? product.price;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAdd = () => {
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    onClose();
    onInstantCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 z-20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gallery Column */}
        <div className="md:w-1/2 p-6 bg-stone-50 flex flex-col justify-between">
          <div className="aspect-square rounded-xl overflow-hidden bg-white border border-stone-200/80 mb-3">
            <img
              src={product.images[selectedImage] || product.images[0] || FALLBACK_PRODUCT_IMAGE}
              alt={stripHtml(product.name)}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
              }}
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-stone-950 ring-1 ring-stone-950'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
              <span className="uppercase tracking-wider">{stripHtml(product.categoryName || '')}</span>
              <span>·</span>
              <span>SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h2 className="text-xl font-bold text-stone-950 font-['Syne'] leading-tight">
              {stripHtml(product.name)}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'stroke-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-700 font-mono">{product.rating}</span>
              <span className="text-xs text-stone-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-stone-950 font-mono">
                {formatPKR(price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="text-sm text-stone-400 line-through font-mono">
                  {formatPKR(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {stripHtml(product.shortDescription)}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-2">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-stone-900">Quantity</span>
                <span className={`font-mono ${maxStock <= 5 ? 'text-amber-600' : 'text-stone-500'}`}>
                  {maxStock > 0 ? `${maxStock} Available in Stock` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-mono text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-semibold font-mono text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-mono text-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-stone-100 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAdd}
                disabled={maxStock === 0}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : maxStock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={maxStock === 0}
                className="py-2.5 px-4 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>Buy Now (COD)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewFullProduct(product);
              }}
              className="w-full text-center text-xs font-medium text-stone-500 hover:text-stone-900 py-1"
            >
              View Full Product Specifications & Verified Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
