export const SITE_CONFIG = {
  name: 'yehmart',
  displayName: 'YehMart',
  legalName: 'YehMart Technologies & Retail Pvt Ltd',
  slogan: 'Pakistan\'s Premier Digital Storefront',
  tagline: 'Precision audio, horology instruments, and modern Pakistani streetwear.',
  announcementText: 'FREE EXPRESS COURIER DELIVERY ON ORDERS OVER RS. 2,000 • CASH ON DELIVERY NATIONWIDE',
  currency: 'PKR',
  currencySymbol: 'Rs. ',
  freeShippingThreshold: 2000,
  standardShippingFee: 199,
  supportPhone: '+92 300 8492026',
  supportEmail: 'care@yehmart.pk',
  whatsappNumber: '+923008492026',
  instagramUrl: 'https://instagram.com/yehmart.pk',
  facebookUrl: 'https://facebook.com/yehmart.pk',
  headquarters: 'Gulberg III, Lahore, Pakistan',
};

export const PAKISTANI_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Islamabad Capital Territory',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
] as const;

export const POPULAR_PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Wah Cantt',
  'Sheikhupura',
  'Jhelum',
  'Rahim Yar Khan',
  'Gujrat',
];

export const COURIER_PARTNERS = [
  { id: 'TCS', name: 'TCS Express Courier', avgDays: '1-2 Days' },
  { id: 'Leopards', name: 'Leopards Courier Service', avgDays: '2-3 Days' },
  { id: 'PostEx', name: 'PostEx Rapid Delivery', avgDays: '1-3 Days' },
  { id: 'Trax', name: 'Trax Logistics', avgDays: '2-3 Days' },
] as const;

export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}
