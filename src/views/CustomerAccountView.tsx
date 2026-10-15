import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/storeService';
import { Order, Address, Product } from '../types';
import { formatPKR, POPULAR_PAKISTANI_CITIES, PAKISTANI_PROVINCES } from '../config/site';

interface CustomerAccountViewProps {
  onTrackOrder: (num: string) => void;
  onSelectProduct: (p: Product) => void;
  onGoToShop: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  onTrackOrder,
  onSelectProduct,
  onGoToShop,
}) => {
  const { user, logout, updateProfile, openLoginModal, openRegisterModal } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');

  // Address modal / form state
  const [addresses, setAddresses] = useState<Address[]>(() => storeService.getAddresses(user?.id));
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Office'>('Home');
  const [newRecipient, setNewRecipient] = useState(user?.fullName || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newProvince, setNewProvince] = useState('Punjab');

  // Profile form state
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const orders = storeService.getOrders();
  const userOrders = user ? orders.filter((o) => o.userId === user.id || o.customerEmail === user.email) : orders;
  const allProducts = storeService.getProducts();
  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newRecipient.trim() || !newPhone.trim()) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      userId: user?.id || 'guest',
      label: newLabel,
      recipientName: newRecipient,
      phone: newPhone,
      streetAddress: newStreet,
      city: newCity,
      province: newProvince,
      isDefault: addresses.length === 0,
    };

    storeService.saveAddress(newAddr);
    setAddresses(storeService.getAddresses(user?.id));
    setShowAddressForm(false);
    setNewStreet('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName: editName, phone: editPhone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  if (!user) {
    return (
      <div className="bg-stone-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <User className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-black text-stone-950 font-['Urbanist','Outfit',sans-serif] tracking-tight">
            Account Sign In Required
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Sign in with your registered YehMart email or create a new account to view your past orders, delivery addresses, and saved wishlist.
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={openLoginModal}
              className="w-full py-3 px-5 bg-stone-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In To Your Account</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={openRegisterModal}
              className="w-full py-3 px-5 bg-stone-100 text-stone-800 hover:bg-stone-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Create New Account</span>
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure authentication via Supabase</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-10 lg:py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xl font-['Syne']">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-950 font-['Syne']">
                {user?.fullName || 'Valued Customer'}
              </h1>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified YehMart Member</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Tab Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Order History</span>
              </div>
              <span className="font-mono text-[11px] opacity-70">{userOrders.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist</span>
              </div>
              <span className="font-mono text-[11px] opacity-70">{wishlist.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Address Book</span>
              </div>
              <span className="font-mono text-[11px] opacity-70">{addresses.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </div>
            </button>
          </div>

          {/* RIGHT: Tab View Content (9 cols) */}
          <div className="lg:col-span-9">
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Past Orders ({userOrders.length})
                </h3>

                {userOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                    <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-stone-900">No orders placed yet</h4>
                    <p className="text-xs text-stone-500 mt-1 mb-4">
                      Browse our collection of acoustic instruments and heavyweight apparel.
                    </p>
                    <button
                      onClick={onGoToShop}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="text-xs text-stone-400 font-mono">Order Number</span>
                          <p className="text-sm font-bold font-mono text-stone-950">{order.orderNumber}</p>
                        </div>
                        <div>
                          <span className="text-xs text-stone-400 font-mono">Placed On</span>
                          <p className="text-xs text-stone-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-stone-400 font-mono">Status</span>
                          <p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-stone-400 font-mono">Total (COD)</span>
                          <p className="text-sm font-bold font-mono text-stone-950">
                            {formatPKR(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="divide-y divide-stone-100 text-xs">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded bg-stone-100"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-stone-900">{item.productName}</p>
                                <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-stone-900">
                              {formatPKR(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => onTrackOrder(order.orderNumber)}
                          className="px-4 py-2 bg-stone-950 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                        >
                          <span>Track Consignment</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Saved Items ({wishlistProducts.length})
                </h3>

                {wishlistProducts.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                    <Heart className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-stone-900">Your wishlist is empty</h4>
                    <p className="text-xs text-stone-500 mt-1 mb-4">
                      Save your favorite products to purchase later or track price drops.
                    </p>
                    <button
                      onClick={onGoToShop}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4 items-center shadow-xs"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{p.name}</h4>
                          <p className="text-xs font-bold font-mono text-stone-950 mt-1">
                            {formatPKR(p.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                addToCart(p);
                                toggleWishlist(p.id);
                              }}
                              className="px-3 py-1 bg-stone-900 text-white text-[11px] font-semibold rounded hover:bg-stone-800"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="text-[11px] text-stone-400 hover:text-rose-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Saved Delivery Addresses
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Label</label>
                        <select
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Phone (Pakistan)</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="House / Street / Area"
                        className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">City</label>
                        <select
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                        >
                          {POPULAR_PAKISTANI_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Province</label>
                        <select
                          value={newProvince}
                          onChange={(e) => setNewProvince(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                        >
                          {PAKISTANI_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 text-white rounded font-bold"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 uppercase tracking-wide">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-stone-800">{addr.recipientName} ({addr.phone})</p>
                      <p className="text-stone-500 leading-relaxed">
                        {addr.streetAddress}, {addr.areaLocality ? `${addr.areaLocality}, ` : ''}{addr.city}, {addr.province}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-lg space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Personal Details
                </h3>

                {profileSaved && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Profile information successfully updated.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-stone-400 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-950 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
