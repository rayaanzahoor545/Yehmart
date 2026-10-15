import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Eye,
  Edit3,
  Code2,
  Sparkles,
  RemoveFormatting,
  UploadCloud,
  X,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write a detailed, high-converting product description...',
  minHeight = '240px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [codeValue, setCodeValue] = useState(value);
  const [showTemplates, setShowTemplates] = useState(false);

  // Image insertion modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [uploadedImageData, setUploadedImageData] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlignment, setImageAlignment] = useState<'center' | 'left' | 'right' | 'full'>('center');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Synchronize initial and external value to visual editor
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setCodeValue(value);
  }, [value, activeTab]);

  const handleVisualInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setCodeValue(html);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCodeValue(newCode);
    onChange(newCode);
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== 'visual') {
      setActiveTab('visual');
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(command, false, arg);
          handleVisualInput();
        }
      }, 50);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleVisualInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter destination URL (e.g. https://yehmart.pk/specs):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertHtmlAtCursor = (htmlToInsert: string) => {
    if (activeTab !== 'visual') {
      const updated = codeValue ? `${codeValue}\n\n${htmlToInsert}` : htmlToInsert;
      setCodeValue(updated);
      onChange(updated);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = htmlToInsert;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        editorRef.current.innerHTML = editorRef.current.innerHTML + htmlToInsert;
      }
      handleVisualInput();
    }
  };

  const handleFileSelectForDescription = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessingImage(true);
      try {
        const result = await compressImage(file, 1200, 1200, 0.85);
        setUploadedImageData(result.dataUrl);
        if (!imageAlt) {
          setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      } catch (err) {
        console.error('Failed to process image file:', err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleConfirmInsertImage = () => {
    const src = imageSourceType === 'upload' ? uploadedImageData : imageUrlInput.trim();
    if (!src) return;

    let figureClass = 'my-4 text-center';
    let imgClass = 'rounded-xl max-w-full shadow-md inline-block';

    if (imageAlignment === 'left') {
      figureClass = 'my-3 sm:float-left sm:mr-4 sm:max-w-xs text-center';
      imgClass = 'rounded-xl max-w-full shadow-md';
    } else if (imageAlignment === 'right') {
      figureClass = 'my-3 sm:float-right sm:ml-4 sm:max-w-xs text-center';
      imgClass = 'rounded-xl max-w-full shadow-md';
    } else if (imageAlignment === 'full') {
      figureClass = 'my-4 w-full text-center';
      imgClass = 'rounded-xl w-full shadow-md object-cover';
    }

    const captionMarkup = imageCaption
      ? `<figcaption style="font-size: 11px; color: #78716c; margin-top: 6px; font-style: italic;">${imageCaption}</figcaption>`
      : '';

    const imageHtml = `<figure class="${figureClass}" style="margin: 1rem 0;"><img src="${src}" alt="${imageAlt || 'Product Specification Image'}" class="${imgClass}" style="max-height: 480px; object-fit: contain; border-radius: 0.75rem;" />${captionMarkup}</figure><p><br/></p>`;

    insertHtmlAtCursor(imageHtml);

    // Reset modal state
    setShowImageModal(false);
    setUploadedImageData('');
    setImageUrlInput('');
    setImageCaption('');
    setImageAlt('');
    setImageAlignment('center');
  };

  // Templates for instant professional copywriting
  const insertTemplate = (templateHtml: string) => {
    const updated = value ? `${value}<br/>${templateHtml}` : templateHtml;
    onChange(updated);
    if (editorRef.current) {
      editorRef.current.innerHTML = updated;
    }
    setCodeValue(updated);
    setShowTemplates(false);
  };

  const templates = [
    {
      name: 'Tech & Wireless Audio Specs',
      icon: '🎧',
      content: `<h3>Engineered Acoustic Specifications</h3>
<ul>
  <li><strong>Driver Architecture:</strong> Custom 11mm Beryllium Neodymium Transducers</li>
  <li><strong>Active Noise Cancellation:</strong> Hybrid 42dB Dual-Mic Feedforward ANC</li>
  <li><strong>Battery Endurance:</strong> Up to 38 hours total playback with USB-C Qi Fast Wireless Charging</li>
  <li><strong>Connectivity:</strong> Bluetooth 5.3 with LDAC, AAC, and Low-Latency Gaming Mode (45ms)</li>
  <li><strong>Water Ingress Protection:</strong> IPX5 Nano-Coated Splash and Sweat Resilience</li>
</ul>
<blockquote>Certified Hi-Res Wireless Audio standard. Dispatched directly from Lahore fulfillment hub with 100% Cash on Delivery.</blockquote>`,
    },
    {
      name: 'Luxury Apparel & Fabric Care',
      icon: '🧵',
      content: `<h3>Craft & Fabric Composition</h3>
<ul>
  <li><strong>Material Grade:</strong> 100% Combed Long-Staple Pakistani Cotton (320 GSM French Terry)</li>
  <li><strong>Silhouette:</strong> Relaxed boxy drop-shoulder architectural cut with reinforced crossover hood</li>
  <li><strong>Dye Technique:</strong> Reactive pigment garment-dyeing with zero fading across laundry cycles</li>
</ul>
<h4>Care & Maintenance Guide</h4>
<ul>
  <li>Machine wash cold inside-out with neutral detergent</li>
  <li>Do not tumble dry; flat air-dry in shade to preserve weave structure</li>
  <li>Cool iron on reverse; avoid direct iron contact with high-density print badges</li>
</ul>`,
    },
    {
      name: 'Mechanical Horology Caliber',
      icon: '⌚',
      content: `<h3>Horological Movement & Construction</h3>
<ul>
  <li><strong>Caliber:</strong> Japanese NH35A Mechanical Automatic (24 Jewels, 21,600 bph, 41-Hour Power Reserve)</li>
  <li><strong>Crystal:</strong> Double-domed scratch-resistant sapphire crystal with anti-reflective underside coating</li>
  <li><strong>Case Fabrication:</strong> 316L Surgical-Grade Monobloc Stainless Steel with screw-down crown</li>
  <li><strong>Water Resistance:</strong> 100M (10 ATM) Tested for swimming, marine exposure, and daily wear</li>
</ul>`,
    },
    {
      name: 'Nationwide COD & Return Guarantee',
      icon: '🛡️',
      content: `<h3>YehMart Trust & Delivery Assurance</h3>
<p>Order with complete confidence under our <strong>Unconditional Pakistani Buyer Guarantee</strong>:</p>
<ul>
  <li><strong>Doorstep Parcel Inspection:</strong> Open and verify packaging with the courier rider before paying cash.</li>
  <li><strong>Rapid Dispatch:</strong> Express courier via TCS & Leopards (24-48 hours across major cities).</li>
  <li><strong>7-Day Doorstep Exchange:</strong> Sizing issue? Our courier rider collects and swaps at your address with zero hassle.</li>
</ul>`,
    },
  ];

  // Real-time metrics
  const textContent = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900 transition-all relative">
      {/* Top Toolbar Header */}
      <div className="bg-stone-50 border-b border-stone-200 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-0.5">
          {/* History */}
          <div className="flex items-center border-r border-stone-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center border-r border-stone-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Styles */}
          <div className="flex items-center border-r border-stone-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-stone-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-stone-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inserts: Links, IMAGES in description, Dividers, Clear */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            {/* DIRECT IMAGE IN DESCRIPTION BUTTON */}
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 transition-colors flex items-center gap-1 font-bold text-xs"
              title="Insert Image into Description"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline text-[11px]">Add Image</span>
            </button>

            <button
              type="button"
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-800 transition-colors"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('removeFormat')}
              className="p-1.5 rounded hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Mode Toggle & Template Menu */}
        <div className="flex items-center gap-2">
          {/* Preset Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Copy Templates</span>
            </button>

            {showTemplates && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 text-xs">
                <div className="font-semibold text-stone-800 px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-stone-500">
                  Insert Spec Blueprint
                </div>
                <div className="space-y-1">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertTemplate(tpl.content)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-100 text-stone-800 flex items-center gap-2 transition-colors"
                    >
                      <span className="text-sm">{tpl.icon}</span>
                      <span className="font-medium">{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs: Visual / Code / Preview */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'visual'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'code'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'preview'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Live View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        {/* Visual WYSIWYG Mode */}
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-4 text-xs sm:text-sm text-stone-800 focus:outline-hidden leading-relaxed prose prose-stone max-w-none overflow-y-auto before:empty:text-stone-400 before:empty:content-[attr(data-placeholder)] [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-stone-950 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:text-stone-600 [&_blockquote]:my-3 [&_hr]:border-stone-200 [&_hr]:my-4 [&_a]:text-emerald-700 [&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-3 [&_figure]:my-4 [&_figure]:text-center [&_figcaption]:text-xs [&_figcaption]:text-stone-500 [&_figcaption]:mt-1"
          />
        )}

        {/* Raw HTML Code Mode */}
        {activeTab === 'code' && (
          <textarea
            value={codeValue}
            onChange={handleCodeChange}
            style={{ minHeight }}
            className="w-full p-4 font-mono text-xs bg-stone-900 text-emerald-400 focus:outline-hidden leading-relaxed resize-y"
            placeholder="<p>Enter HTML markup directly...</p>"
          />
        )}

        {/* Customer Storefront Live Preview Mode */}
        {activeTab === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-5 bg-stone-50/50 text-xs sm:text-sm text-stone-800 leading-relaxed overflow-y-auto [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-stone-950 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:text-stone-600 [&_blockquote]:my-3 [&_hr]:border-stone-200 [&_hr]:my-4 [&_a]:text-emerald-700 [&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-3 [&_figure]:my-4 [&_figure]:text-center [&_figcaption]:text-xs [&_figcaption]:text-stone-500 [&_figcaption]:mt-1"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                '<p class="text-stone-400 italic">No description entered yet. Switch to Editor to compose product copy.</p>',
            }}
          />
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="bg-stone-50 border-t border-stone-200 px-3.5 py-1.5 text-[11px] font-mono text-stone-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>
            Words: <strong className="text-stone-700">{wordCount}</strong>
          </span>
          <span>
            Characters: <strong className="text-stone-700">{charCount}</strong>
          </span>
          <span className="hidden sm:inline">Read Time: ~{Math.ceil(wordCount / 200)} min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-stone-600">Rich HTML & Image Support Active</span>
        </div>
      </div>

      {/* MODAL: INSERT IMAGE INTO PRODUCT DESCRIPTION */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Add Image to Product Description</h4>
                  <p className="text-[11px] text-stone-400">
                    Upload from your device or paste a web URL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs: Upload File vs Web URL */}
            <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageSourceType('upload')}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  imageSourceType === 'upload'
                    ? 'border-emerald-600 text-emerald-900 bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Upload from Computer / Phone
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType('url')}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  imageSourceType === 'url'
                    ? 'border-emerald-600 text-emerald-900 bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Paste Web Image URL
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {imageSourceType === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelectForDescription}
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadedImageData ? (
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 aspect-video flex items-center justify-center">
                      <img
                        src={uploadedImageData}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageData('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-stone-900/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-xl p-6 text-center cursor-pointer bg-stone-50 hover:bg-emerald-50/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 mx-auto flex items-center justify-center text-emerald-600 mb-2 shadow-2xs">
                        {isProcessingImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <p className="font-bold text-stone-800">
                        {isProcessingImage ? 'Optimizing Image...' : 'Click to select image file'}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">
                        PNG, JPG, WEBP from your local machine. Automatically compressed.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Web Image URL</label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:border-stone-900"
                  />
                  {imageUrlInput && (
                    <div className="mt-2 rounded-lg border border-stone-200 overflow-hidden max-h-36 bg-stone-50 flex items-center justify-center">
                      <img
                        src={imageUrlInput}
                        alt="Preview"
                        className="max-h-36 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Caption & Alt Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Precision CNC milled finish"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="e.g. Wireless earbud diaphragm closeup"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Alignment Selector */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image Placement</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageAlignment('center')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      imageAlignment === 'center'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlignment('full')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      imageAlignment === 'full'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Full Width
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlignment('left')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      imageAlignment === 'left'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Wrap Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlignment('right')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      imageAlignment === 'right'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Wrap Right
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  imageSourceType === 'upload' ? !uploadedImageData : !imageUrlInput.trim()
                }
                onClick={handleConfirmInsertImage}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert Image into Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
