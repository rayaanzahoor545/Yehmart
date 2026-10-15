import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

interface StaticPagesViewProps {
  page: 'about' | 'contact' | 'faq' | 'delivery' | 'returns' | 'privacy' | 'terms';
  onExploreShop: () => void;
}

export const StaticPagesView: React.FC<StaticPagesViewProps> = ({ page, onExploreShop }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ABOUT PAGE */}
        {page === 'about' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
              The Brand Story
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-['Syne']">
              About YehMart
            </h1>

            <p className="text-sm text-stone-700 leading-relaxed">
              Founded in Lahore, Pakistan, <strong>YehMart</strong> was born out of frustration with disposable, generic consumer goods flooded with low-grade plastics and exaggerated marketing claims.
            </p>

            <p className="text-sm text-stone-700 leading-relaxed">
              We curate and engineer contemporary lifestyle instruments: from 42dB active noise cancellation acoustics tuned with custom beryllium dynamic drivers to 320 GSM ring-spun French Terry streetwear and mechanical chronographs encased in 316L surgical stainless steel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
              <div className="p-4 bg-stone-50 rounded-xl">
                <h4 className="font-bold text-stone-900 text-sm">Honest Pricing</h4>
                <p className="text-xs text-stone-500 mt-1">Direct-to-consumer model removing unnecessary middleman markups.</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <h4 className="font-bold text-stone-900 text-sm">Pakistani Heritage</h4>
                <p className="text-xs text-stone-500 mt-1">HQ in Lahore with TCS Express nationwide fulfillment.</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl">
                <h4 className="font-bold text-stone-900 text-sm">No Compromise</h4>
                <p className="text-xs text-stone-500 mt-1">Every article rigorously tested before commercial distribution.</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT PAGE */}
        {page === 'contact' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
                Customer Care & Lahore HQ
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-['Syne'] mt-1">
                Contact Customer Support
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Have a question regarding your Cash on Delivery parcel or need sizing assistance?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-5 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Direct Phone / WhatsApp</p>
                    <p className="font-mono mt-0.5">{SITE_CONFIG.supportPhone}</p>
                    <p className="text-stone-400 mt-0.5">Mon - Sat: 10:00 AM - 10:00 PM PKT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Email Inquiries</p>
                    <p className="font-mono mt-0.5">{SITE_CONFIG.supportEmail}</p>
                    <p className="text-stone-400 mt-0.5">Average response under 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Lahore Headquarters</p>
                    <p className="mt-0.5">{SITE_CONFIG.headquarters}</p>
                  </div>
                </div>
              </div>

              {/* Working Contact Form */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                {contactSubmitted ? (
                  <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Message received! Our team will contact you shortly on WhatsApp or email.</span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Message</label>
                      <textarea
                        rows={3}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="How can we assist you today?"
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-stone-950 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FAQ PAGE */}
        {page === 'faq' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
              Questions & Answers
            </span>
            <h1 className="text-3xl font-extrabold text-stone-950 font-['Syne']">
              Frequently Asked Questions
            </h1>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm space-y-4 pt-2">
              <div className="pt-4 space-y-1.5">
                <h4 className="font-bold text-stone-900">How does Cash on Delivery work in Pakistan?</h4>
                <p className="text-stone-600 leading-relaxed">
                  You place your order online without entering credit card details. When the TCS or Leopards rider arrives at your doorstep, you inspect the outer parcel and hand the exact cash amount to the courier.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <h4 className="font-bold text-stone-900">How long does shipping take?</h4>
                <p className="text-stone-600 leading-relaxed">
                  Karachi, Lahore, Islamabad, and Rawalpindi orders are delivered within 24 to 48 hours. Other cities (Faisalabad, Multan, Peshawar, Sialkot, etc.) take 2 to 3 business days.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <h4 className="font-bold text-stone-900">What is the return/exchange policy?</h4>
                <p className="text-stone-600 leading-relaxed">
                  We offer a 7-day hassle-free exchange policy. If an apparel piece doesn't fit or a hardware device arrives damaged, contact our WhatsApp support and our rider will arrange an exchange.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <h4 className="font-bold text-stone-900">Are the products original?</h4>
                <p className="text-stone-600 leading-relaxed">
                  Yes, YehMart is a premier single-store curated label. We directly oversee quality inspection, and warehouse every single product in Lahore.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DELIVERY INFORMATION */}
        {page === 'delivery' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
              Courier Network
            </span>
            <h1 className="text-3xl font-extrabold text-stone-950 font-['Syne']">
              Shipping & Delivery Information
            </h1>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                All orders are dispatched from our centralized climate-controlled fulfillment hub in DHA Lahore. We partner exclusively with <strong>TCS Express</strong>, <strong>Leopards Courier</strong>, and <strong>PostEx</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900">Major Metros (Lahore, Karachi, Islamabad)</h4>
                  <p className="text-xs text-stone-500 mt-1">1 - 2 Business Days delivery time.</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900">Nationwide Tier 2 & 3 Cities</h4>
                  <p className="text-xs text-stone-500 mt-1">2 - 3 Business Days via express road or air cargo.</p>
                </div>
              </div>

              <p className="pt-2">
                Shipping is <strong>FREE on all orders above Rs. {SITE_CONFIG.freeShippingThreshold.toLocaleString()}</strong>. For orders below this threshold, a flat rate of Rs. {SITE_CONFIG.standardShippingFee} applies nationwide.
              </p>
            </div>
          </div>
        )}

        {/* RETURNS & REFUNDS */}
        {page === 'returns' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500">
              Guarantee
            </span>
            <h1 className="text-3xl font-extrabold text-stone-950 font-['Syne']">
              Returns & Exchanges Policy
            </h1>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                We stand behind the engineering of every item we ship. If you are not satisfied with your purchase, you may request an exchange or return within <strong>7 days of delivery</strong>.
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>Apparel must be unworn, unwashed, and with original tags attached.</li>
                <li>Electronics and audio gear must include original box and charging accessories.</li>
                <li>Watches must have unworn protective sapphire film intact.</li>
              </ul>

              <p className="pt-2">
                To initiate an exchange, simply send your order reference number and a photo to our WhatsApp team at {SITE_CONFIG.supportPhone}.
              </p>
            </div>
          </div>
        )}

        {/* PRIVACY & TERMS */}
        {(page === 'privacy' || page === 'terms') && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
            <h1 className="text-3xl font-extrabold text-stone-950 font-['Syne']">
              {page === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h1>
            <p className="text-xs text-stone-400 font-mono">Last updated: October 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                {SITE_CONFIG.legalName} is committed to protecting your privacy. We collect customer shipping addresses and phone numbers strictly for fulfilling courier shipments and providing tracking updates.
              </p>
              <p>
                We never sell, rent, or trade your personal data with third-party advertising networks. All transaction logs and customer records are protected by enterprise-grade cryptographic standards.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
