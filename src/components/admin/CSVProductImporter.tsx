import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Settings2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  stripHtml,
  formatProductDescriptionHtml,
  extractAllImageUrls,
  FALLBACK_PRODUCT_IMAGE,
} from '../../utils/htmlUtils';

interface CSVProductImporterProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onImport: (
    products: Product[],
    removeDummyProducts: boolean,
    autoCreateCategories: boolean
  ) => void;
  existingDummyCount: number;
}

// Sample CSV content with Pakistan pricing, rich HTML descriptions, and embedded image links
const SAMPLE_CSV_CONTENT = `Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Variant Price,Variant Compare At Price,Cost per item,Variant Inventory Qty,Variant SKU,Image Src
nordic-anc-headphones,"Nordic ANC Wireless Studio Headphones","<p>Engineered with custom 40mm beryllium acoustic drivers and 45dB hybrid ANC.</p><p><img src=""https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"" alt=""Studio Acoustic Driver"" /></p><ul><li>40h Playtime with Type-C QuickCharge</li><li>Multipoint Bluetooth 5.3</li><li>Forged aircraft aluminum headband</li></ul>","YehMart Atelier","Tech & Wireless Audio","headphones, audio, anc",TRUE,14500,18900,9500,35,"YM-AUD-01","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
french-terry-hoodie,"Heavyweight French Terry Streetwear Hoodie","<p>380 GSM combed cotton relaxed drop-shoulder silhouette, knitted and tailored in Lahore.</p><p><img src=""https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"" alt=""Fabric Close-up"" /></p>","YehMart Apparel","Men's Minimalist Wear","apparel, hoodie, streetwear",TRUE,6500,8500,3200,45,"YM-APP-01","https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
skeleton-chronometer,"Horology Skeleton Automatic Chronometer","<p>24-jewel Japanese mechanical movement with sapphire crystal and 316L stainless steel case.</p><p><img src=""https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"" alt=""Movement Architecture"" /></p>","YehMart Timepieces","Watches & Chronographs","watches, luxury, automatic",TRUE,22000,28500,14000,18,"YM-WAT-01","https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
leather-bifold,"Full-Grain Vegetable Tanned Leather Bifold","<p>Hand-burnished genuine cowhide leather wallet that develops a rich natural patina over time.</p><p><img src=""https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"" alt=""Leather Craft"" /></p>","YehMart EDC","Everyday Carry & Wallets","leather, wallet, edc",TRUE,4200,5500,2100,60,"YM-EDC-01","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"`;

export const CSVProductImporter: React.FC<CSVProductImporterProps> = ({
  isOpen,
  onClose,
  categories,
  onImport,
  existingDummyCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [field: string]: string }>({});
  const [showMappingDrawer, setShowMappingDrawer] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [removeDummy, setRemoveDummy] = useState<boolean>(false); // User wants to keep dummy products or choose
  const [autoCategories, setAutoCategories] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewProduct, setPreviewProduct] = useState<{
    name: string;
    descriptionHtml: string;
    shortDesc: string;
    images: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Auto-detect delimiter based on header line
  const detectDelimiter = (headerLine: string): string => {
    let commaCount = 0;
    let semiCount = 0;
    let tabCount = 0;
    let inQuote = false;

    for (let i = 0; i < headerLine.length; i++) {
      const c = headerLine[i];
      if (c === '"') {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (c === ',') commaCount++;
        else if (c === ';') semiCount++;
        else if (c === '\t') tabCount++;
      }
    }

    if (tabCount > commaCount && tabCount > semiCount) return '\t';
    if (semiCount > commaCount) return ';';
    return ',';
  };

  // Robust line splitter supporting multiline quotes while preventing infinite quote swallow
  const splitLinesRobust = (text: string): string[] => {
    const rawLines: string[] = [];
    let cur = '';
    let inQuotes = false;

    // Remove BOM and null bytes
    const cleanText = text.replace(/^\uFEFF/, '').replace(/\0/g, '');

    for (let i = 0; i < cleanText.length; i++) {
      const c = cleanText[i];
      const nc = cleanText[i + 1];

      if (c === '"') {
        if (inQuotes && nc === '"') {
          cur += '""';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && nc === '\n') {
          i++;
        }
        if (cur.trim()) {
          rawLines.push(cur);
        }
        cur = '';
      } else {
        cur += c;
      }
    }

    if (cur.trim()) {
      rawLines.push(cur);
    }

    // Safety fallback: If unmatched quote merged everything into a single line, split by newlines
    if (rawLines.length <= 1 && cleanText.includes('\n')) {
      const fallback = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (fallback.length > 1) {
        return fallback;
      }
    }

    return rawLines;
  };

  // Split single CSV row into columns
  const splitRowWithDelimiter = (rowStr: string, delimiter: string): string[] => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];

      if (c === '"') {
        if (inQuotes && nc === '"') {
          cur += '"';
          i++; // escaped quote ""
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  // Main robust CSV parser
  const parseCSV = (text: string) => {
    try {
      setErrorMessage(null);
      if (!text || !text.trim()) {
        setParsedRows([]);
        setHeaders([]);
        return;
      }

      const lines = splitLinesRobust(text);

      if (lines.length < 2) {
        setErrorMessage(
          'The CSV must contain at least a header row and one product row. Check file formatting.'
        );
        setParsedRows([]);
        return;
      }

      const delimiter = detectDelimiter(lines[0]);
      const rawHeaders = splitRowWithDelimiter(lines[0], delimiter).map((h) =>
        h.replace(/^["']|["']$/g, '').trim()
      );

      if (rawHeaders.length === 0 || rawHeaders.every((h) => !h)) {
        setErrorMessage('Could not find valid column headers in the first row.');
        setParsedRows([]);
        return;
      }

      setHeaders(rawHeaders);

      // Auto-detect mappings based on header names (including Shopify, WooCommerce, Excel, Daraz)
      const initialMapping: { [field: string]: string } = {};
      const lowerHeaders = rawHeaders.map((h) => h.toLowerCase());

      const findHeader = (candidates: string[]): string => {
        for (const cand of candidates) {
          const idx = lowerHeaders.findIndex((h) => h.includes(cand));
          if (idx !== -1) return rawHeaders[idx];
        }
        return '';
      };

      initialMapping.handle = findHeader(['handle']);
      initialMapping.name = findHeader([
        'title',
        'name',
        'product name',
        'item',
        'article',
        'product',
        'heading',
      ]);
      initialMapping.price = findHeader([
        'variant price',
        'selling price',
        'sale price',
        'price',
        'rate',
        'pkr',
        'rs',
        'unit price',
        'amount',
      ]);
      initialMapping.compareAtPrice = findHeader([
        'compare at',
        'compare_at_price',
        'regular_price',
        'mrp',
        'original',
        'was',
        'list price',
        'old price',
      ]);
      initialMapping.costPrice = findHeader(['cost per item', 'cost', 'wholesale', 'cogs', 'purchase price']);
      initialMapping.category = findHeader([
        'type',
        'category',
        'collection',
        'department',
        'group',
        'class',
        'dept',
      ]);
      initialMapping.stock = findHeader([
        'variant inventory qty',
        'stock',
        'quantity',
        'qty',
        'inventory',
        'count',
        'units',
        'available',
      ]);
      initialMapping.sku = findHeader(['variant sku', 'sku', 'code', 'barcode', 'item code', 'model']);
      initialMapping.description = findHeader([
        'body (html)',
        'description',
        'desc',
        'body',
        'details',
        'html',
        'specs',
        'specification',
        'info',
      ]);
      initialMapping.shortDescription = findHeader([
        'short description',
        'short',
        'summary',
        'tagline',
        'subtitle',
        'brief',
      ]);
      initialMapping.images = findHeader([
        'image src',
        'images',
        'image',
        'photo',
        'picture',
        'url',
        'src',
        'gallery',
        'image url',
        'img',
      ]);

      // Fallbacks if not auto-matched
      if (!initialMapping.name) {
        // pick first column that looks like text
        initialMapping.name = rawHeaders[0];
      }

      setColumnMapping(initialMapping);

      const rowsData: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = splitRowWithDelimiter(lines[i], delimiter);
        if (cells.length > 0 && cells.some((c) => c.trim())) {
          const rowObj: any = {};
          rawHeaders.forEach((header, idx) => {
            rowObj[header] = cells[idx] ? cells[idx].replace(/^["']|["']$/g, '').trim() : '';
          });
          rowsData.push(rowObj);
        }
      }

      setParsedRows(rowsData);
    } catch (err: any) {
      setErrorMessage(`Failed to parse CSV: ${err.message || 'Syntax error'}`);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setCsvRawText(text);
      parseCSV(text);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file. Please check file permissions or try copying and pasting the CSV text.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvRawText(val);
    if (val.trim()) {
      parseCSV(val);
    } else {
      setParsedRows([]);
      setHeaders([]);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'yehmart_sample_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to extract all images from a row and its description
  const extractRowImages = (row: any, primaryImgCol: string, descText: string): string[] => {
    const collectedImages: string[] = [];

    // 1. Check primary image column
    if (primaryImgCol && row[primaryImgCol]) {
      const splitUrls = String(row[primaryImgCol])
        .split(/[,|;\n\s]+/)
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter((s) => s.length > 5 && (s.startsWith('http') || s.startsWith('data:image')));
      collectedImages.push(...splitUrls);
    }

    // 2. Check all other columns whose name includes image, photo, or picture
    headers.forEach((h) => {
      const lh = h.toLowerCase();
      if (
        (lh.includes('image') || lh.includes('photo') || lh.includes('picture') || lh.includes('img')) &&
        h !== primaryImgCol &&
        row[h]
      ) {
        const extraUrls = String(row[h])
          .split(/[,|;\n\s]+/)
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter((s) => s.length > 5 && (s.startsWith('http') || s.startsWith('data:image')));
        collectedImages.push(...extraUrls);
      }
    });

    // 3. Extract images embedded in HTML description (<img src="..."> or markdown)
    if (descText) {
      const embedded = extractAllImageUrls(descText);
      collectedImages.push(...embedded);
    }

    // Deduplicate
    const unique = Array.from(new Set(collectedImages));
    return unique.length > 0 ? unique : [FALLBACK_PRODUCT_IMAGE];
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) {
      setErrorMessage('No products found to import. Please select a CSV file or paste product data.');
      return;
    }

    const handleCol = columnMapping.handle;
    const nameCol = columnMapping.name || headers[0];
    const priceCol = columnMapping.price;
    const compareCol = columnMapping.compareAtPrice;
    const costCol = columnMapping.costPrice;
    const catCol = columnMapping.category;
    const stockCol = columnMapping.stock;
    const skuCol = columnMapping.sku;
    const descCol = columnMapping.description;
    const shortDescCol = columnMapping.shortDescription;
    const imgCol = columnMapping.images;

    // Check if this CSV uses Shopify-style multi-row grouping with Handle
    const hasShopifyHandles = Boolean(handleCol && parsedRows.some((r) => r[handleCol]));

    let groupedRows: { [handle: string]: any[] } = {};
    if (hasShopifyHandles) {
      parsedRows.forEach((row, idx) => {
        const handleVal = row[handleCol] || `row-${idx}`;
        if (!groupedRows[handleVal]) {
          groupedRows[handleVal] = [];
        }
        groupedRows[handleVal].push(row);
      });
    }

    const productGroups = hasShopifyHandles
      ? Object.values(groupedRows)
      : parsedRows.map((r) => [r]);

    const importedProducts: Product[] = productGroups.map((group, index) => {
      const primaryRow = group.find((r) => r[nameCol]?.trim()) || group[0];

      // Clean title: remove any HTML tags
      const rawTitle = primaryRow[nameCol] || `Imported Product #${index + 1}`;
      const cleanName = stripHtml(rawTitle) || `Imported Product #${index + 1}`;

      // Numbers
      const rawPrice =
        Number(String(primaryRow[priceCol] || '1999').replace(/[^0-9.]/g, '')) || 1999;
      const rawCompare =
        compareCol && primaryRow[compareCol]
          ? Number(String(primaryRow[compareCol]).replace(/[^0-9.]/g, ''))
          : undefined;
      const rawCost =
        costCol && primaryRow[costCol]
          ? Number(String(primaryRow[costCol]).replace(/[^0-9.]/g, ''))
          : undefined;
      const rawStock = Number(String(primaryRow[stockCol] || '25').replace(/[^0-9]/g, '')) || 25;

      // Category
      const rawCat = (catCol && primaryRow[catCol] ? String(primaryRow[catCol]) : '').trim();
      let cleanCatName = stripHtml(rawCat).trim();
      if (
        !cleanCatName ||
        cleanCatName.length > 40 ||
        cleanCatName.toLowerCase().includes('http') ||
        cleanCatName.toLowerCase().includes('original video') ||
        cleanCatName.toLowerCase().includes('description')
      ) {
        cleanCatName = 'Curated Luxury';
      }

      // SKU
      const rawSku = (
        skuCol && primaryRow[skuCol]
          ? primaryRow[skuCol]
          : `YM-${Date.now().toString().slice(-4)}-${index + 1}`
      ).trim();

      // Description & HTML Processing
      const rawDescString =
        descCol && primaryRow[descCol]
          ? primaryRow[descCol]
          : `<p>${cleanName} - Premium quality verified by YehMart.</p>`;
      const cleanFormattedDescription = formatProductDescriptionHtml(rawDescString);

      // Short Description
      let cleanShortDescription = '';
      if (shortDescCol && primaryRow[shortDescCol]) {
        cleanShortDescription = stripHtml(primaryRow[shortDescCol]);
      }
      if (!cleanShortDescription) {
        const plainFromDesc = stripHtml(rawDescString);
        cleanShortDescription =
          plainFromDesc.length > 140
            ? plainFromDesc.slice(0, 140) + '...'
            : plainFromDesc || cleanName;
      }

      // Collect all images across all rows in the group
      const allImagesForProduct: string[] = [];
      group.forEach((row) => {
        const rowImgs = extractRowImages(row, imgCol, row[descCol] || '');
        allImagesForProduct.push(...rowImgs);
      });
      const uniqueImages = Array.from(new Set(allImagesForProduct)).filter(
        (url) => url.length > 5 && (url.startsWith('http') || url.startsWith('data:image'))
      );
      const finalImages = uniqueImages.length > 0 ? uniqueImages : [FALLBACK_PRODUCT_IMAGE];

      // Match or generate category ID
      const matchedCat = categories.find(
        (c) => stripHtml(c.name).toLowerCase().trim() === cleanCatName.toLowerCase()
      );
      const safeSlug =
        cleanCatName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'curated-luxury';
      const categoryId = matchedCat ? matchedCat.id : `cat-${safeSlug}`;

      const id = `prod-imp-${Date.now()}-${index + 1}`;
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      return {
        id,
        name: cleanName,
        slug,
        categoryId,
        categoryName: cleanCatName,
        sku: rawSku,
        shortDescription: cleanShortDescription,
        description: cleanFormattedDescription,
        price: rawPrice,
        compareAtPrice: rawCompare,
        costPrice: rawCost,
        stock: rawStock,
        lowStockThreshold: 5,
        images: finalImages,
        specifications: {
          Inspection: 'Doorstep Courier Verification',
          Guarantee: '100% Authentic YehMart Standard',
        },
        isPublished: true,
        isFeatured: index < 4,
        isNewArrival: true,
        isBestseller: index % 3 === 0,
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
    });

    onImport(importedProducts, removeDummy, autoCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Syne']">
                CSV Products Importer & Catalog Setup
              </h3>
              <p className="text-xs text-stone-400">
                Upload your products spreadsheet (.csv), preview mapped columns, clean descriptions, and upload.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-400 text-white font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload CSV File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-emerald-400 text-white font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste CSV Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'template'
                ? 'border-emerald-400 text-white font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: FILE UPLOAD WITH DRAG AND DROP */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv, .txt, .tsv, text/csv, text/plain, application/vnd.ms-excel"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
                    : 'border-stone-700 hover:border-emerald-400 bg-stone-950/40 hover:bg-emerald-950/10'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-800 mx-auto flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {fileName ? `Selected: ${fileName}` : 'Choose or Drag Your CSV File Here'}
                </h4>
                <p className="text-stone-400 text-xs max-w-sm mx-auto mb-3">
                  Upload .csv exported from Shopify, WooCommerce, Excel, or Daraz inventory sheets.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-stone-950 font-bold hover:bg-stone-200 transition-colors shadow-md">
                  <span>Browse CSV File</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE RAW TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-300">
                Paste your CSV content with headers below:
              </label>
              <textarea
                value={csvRawText}
                onChange={handleTextareaChange}
                rows={8}
                placeholder={`Title,Variant Price,Variant Compare At Price,Type,Variant Inventory Qty,Variant SKU,Body (HTML),Image Src\n"Precision Mechanical Watch",19500,24000,"Watches",20,"YM-W1","<p>Ultra durable watch with sapphire glass</p>","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"`}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 placeholder-stone-600 focus:outline-hidden focus:border-emerald-400 leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => parseCSV(csvRawText)}
                  className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Parse & Preview Content
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-4 bg-stone-950/60 p-5 rounded-2xl border border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Standard YehMart CSV Template
                  </h4>
                  <p className="text-stone-400 text-xs">
                    Download this pre-formatted CSV template with columns for titles, Pakistani Rupee prices, categories, stock, rich HTML descriptions, and images.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black flex items-center gap-2 transition-all self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .CSV</span>
                </button>
              </div>

              <div className="border border-stone-800 rounded-xl p-3 bg-stone-900 overflow-x-auto">
                <div className="text-[11px] font-mono text-stone-400 whitespace-pre">
                  {SAMPLE_CSV_CONTENT.slice(0, 360)}...
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Options & Dummy Products Cleaner */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="font-bold text-stone-200 uppercase tracking-wider text-[11px] font-mono">
              Import Configuration & Cleanup
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={removeDummy}
                  onChange={(e) => setRemoveDummy(e.target.checked)}
                  className="mt-0.5 rounded border-stone-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove dummy demo products upon import</span>
                  </span>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    {removeDummy
                      ? `Will wipe all demo items (${existingDummyCount} products) so only your authentic CSV items are in your store.`
                      : `Keeps initial demo items and adds your CSV items alongside them.`}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={autoCategories}
                  onChange={(e) => setAutoCategories(e.target.checked)}
                  className="mt-0.5 rounded border-stone-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>Auto-create categories if they don&apos;t exist</span>
                  </span>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Any new department name found in your CSV will be automatically registered in the store catalog.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* COLUMN MAPPING ACCORDION */}
          {headers.length > 0 && (
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">
                    Column Mapping ({headers.length} CSV Columns Detected)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMappingDrawer(!showMappingDrawer)}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  {showMappingDrawer ? 'Hide Column Mapping' : 'Customize Column Mapping'}
                </button>
              </div>

              {showMappingDrawer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-stone-800/80">
                  {[
                    { label: 'Product Name / Title *', key: 'name' },
                    { label: 'Selling Price (PKR) *', key: 'price' },
                    { label: 'Compare Price (Original)', key: 'compareAtPrice' },
                    { label: 'Category / Collection', key: 'category' },
                    { label: 'Stock / Inventory Qty', key: 'stock' },
                    { label: 'SKU / Barcode', key: 'sku' },
                    { label: 'Images / Gallery', key: 'images' },
                    { label: 'Description (HTML / Text)', key: 'description' },
                    { label: 'Short Description', key: 'shortDescription' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] font-mono text-stone-400 uppercase">
                        {field.label}
                      </label>
                      <select
                        value={columnMapping[field.key] || ''}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [field.key]: e.target.value })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="">-- None / Auto --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PARSED DATA PREVIEW */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Detected Catalog Products
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                    {parsedRows.length} Rows Ready
                  </span>
                </div>

                <span className="text-stone-400 text-[11px]">
                  HTML formatted & images detected
                </span>
              </div>

              {/* Table Preview */}
              <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-900/90 text-stone-400 border-b border-stone-800 text-[11px] uppercase tracking-wider font-mono">
                        <th className="p-3">#</th>
                        <th className="p-3">Photo</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Selling Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 font-sans">
                      {parsedRows.slice(0, 15).map((row, idx) => {
                        const nameCol = columnMapping.name || headers[0];
                        const priceCol = columnMapping.price;
                        const catCol = columnMapping.category;
                        const stockCol = columnMapping.stock;
                        const descCol = columnMapping.description;
                        const imgCol = columnMapping.images;

                        const rawName = row[nameCol] || 'Untitled';
                        const cleanName = stripHtml(rawName) || 'Untitled';
                        const price = row[priceCol] || '0';
                        const cat = stripHtml(row[catCol] || 'Curated Luxury');
                        const stock = row[stockCol] || '25';
                        const rowDesc = row[descCol] || '';
                        const rowImgs = extractRowImages(row, imgCol, rowDesc);
                        const firstImg = rowImgs[0] || FALLBACK_PRODUCT_IMAGE;

                        return (
                          <tr key={idx} className="hover:bg-stone-900/40">
                            <td className="p-3 text-stone-500 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 shrink-0">
                                <img
                                  src={firstImg}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                                  }}
                                />
                                {rowImgs.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-stone-950/90 text-white text-[9px] font-mono px-1 rounded-tl">
                                    {rowImgs.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-white max-w-xs">
                              <div className="truncate">{cleanName}</div>
                              <div className="text-[10px] text-stone-400 font-mono">
                                {rowImgs.length} image{rowImgs.length === 1 ? '' : 's'} detected
                              </div>
                            </td>
                            <td className="p-3 text-stone-300">{cat}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              Rs. {Number(String(price).replace(/[^0-9.]/g, '') || 0).toLocaleString()}
                            </td>
                            <td className="p-3 font-mono text-stone-300">{stock}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewProduct({
                                    name: cleanName,
                                    descriptionHtml: formatProductDescriptionHtml(rowDesc),
                                    shortDesc: stripHtml(rowDesc).slice(0, 140),
                                    images: rowImgs,
                                  })
                                }
                                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {parsedRows.length > 15 && (
                  <div className="p-2.5 bg-stone-900/80 text-center text-stone-400 text-[11px] font-mono border-t border-stone-800">
                    + and {parsedRows.length - 15} more products in your CSV file
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {parsedRows.length > 0
                ? `${parsedRows.length} articles ready to import into YehMart`
                : 'Please load a CSV file or paste product rows above'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={handleExecuteImport}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 text-xs font-black shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>
                {removeDummy
                  ? `Wipe Dummy & Import ${parsedRows.length} Products`
                  : `Import ${parsedRows.length} Products`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDERED PREVIEW SUB-MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Live HTML & Media Render Test
                </span>
                <h4 className="text-base font-bold text-white font-['Syne']">
                  {previewProduct.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs">
              {/* Images preview */}
              <div>
                <p className="font-bold text-stone-300 mb-2">
                  Detected Product Images ({previewProduct.images.length}):
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {previewProduct.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-stone-700 bg-stone-950"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Cleaned plain summary */}
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <p className="text-[11px] font-bold text-stone-400 uppercase font-mono mb-1">
                  Cleaned Plain Text Summary (for Product Card):
                </p>
                <p className="text-stone-300">{previewProduct.shortDesc}</p>
              </div>

              {/* Rendered HTML */}
              <div className="p-4 bg-white text-stone-900 rounded-2xl border border-stone-200">
                <p className="text-[11px] font-bold text-stone-400 uppercase font-mono mb-2">
                  Rendered Product Description (Storefront View):
                </p>
                <div
                  className="text-stone-800 leading-relaxed space-y-2 [&_h1]:text-lg [&_h1]:font-black [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:mx-auto [&_img]:my-3"
                  dangerouslySetInnerHTML={{ __html: previewProduct.descriptionHtml }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
