import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  formatPKR,
  SITE_CONFIG,
  POPULAR_PAKISTANI_CITIES,
  PAKISTANI_PROVINCES,
  COURIER_PARTNERS,
} from '../config/site';
import { storeService } from '../services/storeService';
import { Order, PaymentMethod } from '../types';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onBackToCart,
}) => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.fullName || 'Ali Ahmed');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'a.aliahmed9704@gmail.com');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '03001234567');
  const [streetAddress, setStreetAddress] = useState('House 14-B, Street 3, Sector F-7/2');
  const [areaLocality, setAreaLocality] = useState('F-7 Markaz');
  const [city, setCity] = useState('Islamabad');
  const [province, setProvince] = useState('Islamabad Capital Territory');
  const [postalCode, setPostalCode] = useState('44000');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [selectedCourier, setSelectedCourier] = useState<'TCS' | 'Leopards' | 'PostEx'>('TCS');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shippingFee = subtotal >= SITE_CONFIG.freeShippingThreshold ? 0 : SITE_CONFIG.standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = storeService.validateCoupon(couponCode, subtotal);
    if (res.valid) {
      setDiscountAmount(res.discountAmount);
      setCouponFeedback(`✓ ${res.message}`);
    } else {
      setDiscountAmount(0);
      setCouponFeedback(`✕ ${res.message}`);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!customerPhone.trim() || !streetAddress.trim() || !customerName.trim()) {
      setErrorMessage('Please complete all mandatory delivery fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderItems = cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        orderId: '',
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.selectedVariant?.name,
        sku: item.selectedVariant?.sku || item.product.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
        imageUrl: item.product.images[0],
      }));

      const newOrder = storeService.createOrder({
        userId: user?.id,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          recipientName: customerName,
          phone: customerPhone,
          streetAddress,
          areaLocality,
          city,
          province,
          postalCode,
        },
        deliveryNotes,
        items: orderItems,
        subtotal,
        discountAmount,
        couponCode: discountAmount > 0 ? couponCode : undefined,
        shippingFee,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: 'unpaid',
        trackingCarrier: selectedCourier,
      });

      clearCart();
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 lg:py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <div>
            <button
              onClick={onBackToCart}
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5 font-medium mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shopping Bag</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-['Syne']">
              One-Page Checkout
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold">SSL 256-Bit Encrypted</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Customer and Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] flex items-center justify-center font-mono">
                  1
                </span>
                <span>Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Asad Siddiqui"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Pakistani Mobile Phone * (For TCS/Leopards SMS)
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address * (For order invoice & tracking)
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                />
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] flex items-center justify-center font-mono">
                  2
                </span>
                <span>Delivery Address (Pakistan)</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address & House/Apartment Number *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 7, Block B"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sector / Area / Locality
                  </label>
                  <input
                    type="text"
                    value={areaLocality}
                    onChange={(e) => setAreaLocality(e.target.value)}
                    placeholder="e.g. DHA Phase 5 / Gulberg"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-hidden focus:border-stone-900"
                  >
                    {POPULAR_PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-hidden focus:border-stone-900"
                  >
                    {PAKISTANI_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Near Shell pump, call before arrival"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-stone-900"
                />
              </div>
            </div>

            {/* Step 3: Courier Selection */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] flex items-center justify-center font-mono">
                  3
                </span>
                <span>Select Courier Service</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {COURIER_PARTNERS.slice(0, 3).map((courier) => (
                  <button
                    type="button"
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCourier === courier.id
                        ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <p className="text-xs font-bold">{courier.id}</p>
                    <p className={`text-[10px] mt-0.5 ${selectedCourier === courier.id ? 'text-stone-300' : 'text-stone-500'}`}>
                      {courier.avgDays}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] flex items-center justify-center font-mono">
                  4
                </span>
                <span>Payment Method</span>
              </h3>

              <div className="space-y-2.5">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-0.5 text-stone-900 focus:ring-stone-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Cash on Delivery (COD) — Recommended
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      Inspect package first. Hand exact cash amount to the courier rider upon delivery.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-0.5 text-stone-900 focus:ring-stone-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Direct Bank Transfer / Raast (Meezan / HBL / Alfalah)
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Account IBAN provided on confirmation screen. Send payment screenshot on WhatsApp.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary & Placement (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 sticky top-24">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider pb-3 border-b border-stone-100">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List Mini */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-950 shrink-0">
                      {formatPKR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. WELCOME10)"
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:outline-hidden focus:border-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p className="text-[11px] mt-1.5 font-medium text-stone-700">{couponFeedback}</p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs pt-3 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-stone-900">{formatPKR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Courier Delivery ({city}):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : formatPKR(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 text-base font-extrabold text-stone-950 border-t border-stone-200">
                  <span>Total Payable:</span>
                  <span className="font-mono text-xl">{formatPKR(grandTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>CONFIRM ORDER (CASH ON DELIVERY)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero advance deposit needed</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
