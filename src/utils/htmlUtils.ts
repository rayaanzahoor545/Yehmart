/**
 * HTML Sanitization, Decoding, and Image Extraction Utility for Product Catalogs
 * Solves raw HTML string issues from CSV imports and ensures images and formatting display professionally.
 */

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

/**
 * Decodes HTML entities (e.g., &lt;p&gt; -> <p>, &amp; -> &, &quot; -> ")
 * Handles double-encoded entities (e.g. &amp;lt; -> <)
 */
export function decodeHtmlEntities(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let str = input;

  // First pass: replace double-encoded and common entities
  for (let pass = 0; pass < 2; pass++) {
    const prev = str;
    str = str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x2F;/gi, '/')
      .replace(/&#47;/g, '/');
    if (str === prev) break;
  }

  // Handle named character references in browser if needed
  try {
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined' && str.includes('&')) {
      const doc = new DOMParser().parseFromString(str, 'text/html');
      // If the string contains tags that were encoded, doc.body.textContent would destroy tags.
      // So we only replace entities that don't produce new unescaped tag delimiters.
    }
  } catch {
    // Ignore DOMParser error
  }

  return str;
}

/**
 * Strips all HTML tags and leaves clean, human-readable plain text.
 * Used for shortDescription, card previews, table summaries, and SEO meta tags.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const decoded = decodeHtmlEntities(input);

  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts all image URLs found in an HTML or text string.
 * Supports:
 * - <img src="..."> tags
 * - Markdown images ![alt](url)
 * - Raw image URLs (http...jpg/png/webp)
 * - Comma/pipe/space separated image lists
 */
export function extractAllImageUrls(input: string): string[] {
  if (!input || typeof input !== 'string') return [];

  const foundUrls: string[] = [];
  const decoded = decodeHtmlEntities(input);

  // 1. Match HTML <img ... src="..." />
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgTagRegex.exec(decoded)) !== null) {
    if (match[1] && match[1].trim()) {
      foundUrls.push(match[1].trim());
    }
  }

  // 2. Match Markdown images: ![alt](url)
  const mdImgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi;
  while ((match = mdImgRegex.exec(decoded)) !== null) {
    if (match[1] && match[1].trim()) {
      foundUrls.push(match[1].trim());
    }
  }

  // 3. Match raw URLs ending in image extensions or known CDNs
  const rawUrlRegex =
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|avif|gif)(?:\?[^\s"'<>]*)?/gi;
  while ((match = rawUrlRegex.exec(decoded)) !== null) {
    if (match[0] && match[0].trim()) {
      foundUrls.push(match[0].trim());
    }
  }

  // 4. Match Shopify CDN / Unsplash / Cloudinary / data: URLs
  const cdnRegex =
    /(?:https:\/\/cdn\.shopify\.com\/[^\s"'<>]+|https:\/\/images\.unsplash\.com\/[^\s"'<>]+|data:image\/[a-zA-Z+]+;base64,[^\s"'<>]+)/gi;
  while ((match = cdnRegex.exec(decoded)) !== null) {
    if (match[0] && match[0].trim()) {
      foundUrls.push(match[0].trim());
    }
  }

  // Deduplicate and filter out invalid/empty URLs
  const uniqueUrls: string[] = [];
  for (let url of foundUrls) {
    url = url.replace(/^["']|["']$/g, '').trim();
    if (
      url.length > 5 &&
      (url.startsWith('http') || url.startsWith('data:image')) &&
      !uniqueUrls.includes(url)
    ) {
      uniqueUrls.push(url);
    }
  }

  return uniqueUrls;
}

/**
 * Formats product description into clean, beautiful, responsive HTML.
 * Handles entity-decoded HTML, raw CSV quotes (""), markdown images, and plain text.
 */
export function formatProductDescriptionHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '<p class="text-stone-600">Product details and specifications verified by YehMart.</p>';
  }

  // 1. Unescape CSV quotes (e.g. "" -> " or \" -> ")
  let content = input
    .replace(/\\"/g, '"')
    .replace(/""/g, '"');

  // 2. Decode entities if it looks like escaped HTML (contains &lt;p or &lt;div or &lt;span or &lt;img)
  if (/&lt;(?:p|div|span|h[1-6]|ul|ol|li|img|strong|em|b|i|table|figure)\b/i.test(content)) {
    content = decodeHtmlEntities(content);
  }

  // 3. Remove harmful scripts or iframes
  content = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+=["'][^"']*["']/gi, ''); // remove onload, onerror handlers

  // 4. Convert Markdown images: ![alt](url) -> responsive HTML figure
  content = content.replace(
    /!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<figure class="my-5 text-center"><img src="$2" alt="$1" class="rounded-2xl shadow-md max-w-full mx-auto border border-stone-200/80 object-cover" loading="lazy" referrerpolicy="no-referrer" /><figcaption class="text-xs text-stone-500 mt-2 italic">$1</figcaption></figure>'
  );

  // 5. Convert standalone image URLs on their own line into figures
  content = content.replace(
    /(?:^|\n)(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|avif|gif)(?:\?[^\s"'<>]*)?)(?:$|\n)/g,
    '\n<figure class="my-5 text-center"><img src="$1" alt="Product feature" class="rounded-2xl shadow-md max-w-full mx-auto border border-stone-200/80 object-cover" loading="lazy" referrerpolicy="no-referrer" /></figure>\n'
  );

  // 6. Check if content has HTML tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (!hasHtmlTags) {
    // It's plain text: split by double newlines into <p> tags
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      content = paragraphs
        .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('');
    } else {
      content = `<p>${content}</p>`;
    }
  }

  // 7. Inject responsive, lazy-loading, and security attributes to all <img> tags
  content = content.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    // If it already has referrerpolicy or loading, keep or normalize
    let newAttrs = attrs;
    if (!/loading=/i.test(newAttrs)) {
      newAttrs += ' loading="lazy"';
    }
    if (!/referrerpolicy=/i.test(newAttrs)) {
      newAttrs += ' referrerpolicy="no-referrer"';
    }
    // Clean out fixed widths that blow out mobile layouts (e.g. width="1200")
    newAttrs = newAttrs.replace(/\b(width|height)=["']\d{4,}["']/gi, '');
    newAttrs = newAttrs.replace(/style=["'][^"']*width:\s*\d{4,}px[^"']*["']/gi, '');

    // Ensure styling classes exist
    if (!/class=/i.test(newAttrs)) {
      newAttrs += ' class="rounded-2xl shadow-md max-w-full mx-auto my-4 border border-stone-200/80 object-cover"';
    }

    return `<img${newAttrs}>`;
  });

  return content;
}
