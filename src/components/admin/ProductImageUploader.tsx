import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Eye,
  Plus,
  Link as LinkIcon,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { compressImage, formatKb } from '../../utils/imageUtils';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 12,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMessage('Please select valid image files (PNG, JPG, WEBP, GIF).');
      return;
    }

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const toProcess = fileArray.slice(0, availableSlots);
    setIsProcessing(true);
    setProcessingCount(toProcess.length);
    setErrorMessage(null);

    const newImageUrls: string[] = [];

    for (const file of toProcess) {
      try {
        const result = await compressImage(file, 1400, 1400, 0.85);
        newImageUrls.push(result.dataUrl);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    if (newImageUrls.length > 0) {
      onChange([...images, ...newImageUrls]);
    }

    setIsProcessing(false);
    setProcessingCount(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so same files can be re-selected if deleted
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([item, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (images.length >= maxImages) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
      return;
    }
    onChange([...images, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlInput(false);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
        multiple
        className="hidden"
      />

      {/* Main Drag-and-Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-950/40 scale-[1.01]'
            : 'border-stone-800 hover:border-stone-600 bg-stone-900/60 hover:bg-stone-900'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-emerald-400 mb-3 shadow-inner group-hover:scale-110 transition-transform">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold text-white mb-1">
            {isProcessing
              ? `Processing & Optimizing ${processingCount} Image${processingCount > 1 ? 's' : ''}...`
              : 'Drag & Drop Product Images Here'}
          </h4>

          <p className="text-xs text-stone-400 mb-3">
            Select files directly from your computer or phone. Multi-select supported.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-stone-400">
            <span className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700/50">
              JPG, PNG, WEBP, GIF
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700/50">
              Auto-Compressed for Fast Load
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700/50">
              {images.length} / {maxImages} Uploaded
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-950 text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Browse Image Files</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Secondary Web URL Accordion Toggle */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-stone-400">
          Uploaded Media Gallery ({images.length} of {maxImages})
        </span>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide Web URL Input' : 'Or add via Web Image URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-stone-300">
            Paste Web Image URL (e.g. Unsplash or CDN)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition-colors"
            >
              Add Link
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="p-8 rounded-2xl bg-stone-900/40 border border-stone-800/60 text-center text-stone-500 text-xs">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
          <p>No product images uploaded yet.</p>
          <p className="text-[11px] text-stone-600 mt-0.5">
            Upload from your device above to showcase your product in high fidelity.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
          {images.map((imgUrl, index) => {
            const isCover = index === 0;
            return (
              <div
                key={index}
                className={`group relative rounded-xl overflow-hidden border aspect-square bg-stone-950 flex flex-col justify-between transition-all ${
                  isCover
                    ? 'border-amber-400/90 ring-2 ring-amber-400/30 shadow-lg'
                    : 'border-stone-800 hover:border-stone-700 shadow-xs'
                }`}
              >
                {/* Image Element */}
                <img
                  src={imgUrl}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Cover Badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-[9px] tracking-wider uppercase font-mono shadow-md flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-stone-950" />
                    <span>MAIN COVER</span>
                  </div>
                )}

                {/* Image Sequence Number */}
                <div className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono text-stone-300">
                  #{index + 1}
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(imgUrl)}
                      className="p-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs transition-colors"
                      title="Zoom Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ordering Controls & Set Cover */}
                  <div className="space-y-1.5">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="w-full py-1 px-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Star className="w-3 h-3 fill-stone-950" />
                        <span>Set as Cover</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveLeft(index)}
                        className="flex-1 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-300 text-[10px] font-semibold border border-stone-800 flex items-center justify-center gap-1 transition-colors"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Left</span>
                      </button>

                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveRight(index)}
                        className="flex-1 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-300 text-[10px] font-semibold border border-stone-800 flex items-center justify-center gap-1 transition-colors"
                        title="Move Right"
                      >
                        <span>Right</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-950/80 hover:bg-stone-950 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
