import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Truck, Tag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR, SITE_CONFIG } from '../config/site';
import { storeService } from '../services/storeService';

interface CartViewProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    success?: boolean;
    message: string;
    discount?: number;
  } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = storeService.validateCoupon(couponInput, subtotal);
    if (res.valid) {
      setCouponFeedback({ success: true, message: res.message, discount: res.discountAmount });
    } else {
      setCouponFeedback({ success: false, message: res.message, discount: 0 });
    }
  };

  const discountAmount = couponFeedback?.discount || 0;
  const shippingFee = subtotal >= SITE_CONFIG.freeShippingThreshold ? 0 : SITE_CONFIG.standardShippingFee;
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-stone-50 border-b border-stone-200">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-['Syne']">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm">
          Explore our collection of minimal audio, automatic watches, and heavyweight streetwear.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-6 px-6 py-2.5 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-10 lg:py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
              Checkout Bag
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-['Syne'] mt-0.5">
              Review Your Cart
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Bag</span>
          </button>
        </div>

        {/* Free Shipping Alert */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-stone-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 font-semibold text-stone-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-700">Congratulations! You unlocked FREE Delivery across Pakistan.</span>
              ) : (
                <span>
                  Add <strong>{formatPKR(amountNeededForFreeShipping)}</strong> more to get FREE Express Shipping!
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500 font-bold">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* 2-Column Table and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Line Items Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
            {cart.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200/80"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{item.product.name}</h3>
                    {item.selectedVariant && (
                      <p className="text-xs text-stone-500 mt-0.5">Variant: {item.selectedVariant.name}</p>
                    )}
                    <p className="text-xs font-mono font-bold text-stone-950 mt-1">
                      {formatPKR(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 text-xs font-mono"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-semibold font-mono text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 text-xs font-mono"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-extrabold font-mono text-stone-950 min-w-[80px] text-right">
                    {formatPKR(item.unitPrice * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Coupon Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Promo Code Input */}
            <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Apply Promo Code</span>
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10 or EID2026"
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-hidden focus:border-stone-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Apply
                </button>
              </form>

              {couponFeedback && (
                <p
                  className={`text-xs mt-2 font-medium ${
                    couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Calculations Card */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Order Breakdown
              </h3>

              <div className="space-y-2 text-xs divide-y divide-stone-100">
                <div className="flex justify-between py-1 text-stone-600">
                  <span>Bag Subtotal:</span>
                  <span className="font-mono font-bold text-stone-900">{formatPKR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-medium">
                    <span>Coupon Discount:</span>
                    <span className="font-mono font-bold">-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 text-stone-600">
                  <span>Courier Shipping:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {shippingFee === 0 ? <span className="text-emerald-700 uppercase">FREE</span> : formatPKR(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 text-base font-extrabold text-stone-950">
                  <span>Grand Total:</span>
                  <span className="font-mono text-lg">{formatPKR(finalTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 bg-stone-950 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>CHECKOUT WITH CASH ON DELIVERY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Advance Payment Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
