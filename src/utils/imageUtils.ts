/**
 * Image compression and client-side optimization utility
 * Resizes large smartphone and camera photos before storing them in local application state,
 * preventing browser localStorage quota overflows while maintaining crisp display quality.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  originalName: string;
}

export const compressImage = (
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.84
): Promise<OptimizedImageResult> => {
  return new Promise((resolve, reject) => {
    // If it's an SVG, don't compress with canvas
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          sizeKb: Math.round(file.size / 1024),
          width: 0,
          height: 0,
          originalName: file.name,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            sizeKb: Math.round(file.size / 1024),
            width: img.width,
            height: img.height,
            originalName: file.name,
          });
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for better compression, fallback to JPEG
        let mimeType = 'image/jpeg';
        if (file.type === 'image/webp') {
          mimeType = 'image/webp';
        }

        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          // Calculate approx base64 size in KB
          const head = dataUrl.indexOf(',');
          const base64Length = dataUrl.length - (head + 1);
          const sizeInBytes = Math.round((base64Length * 3) / 4);

          resolve({
            dataUrl,
            sizeKb: Math.round(sizeInBytes / 1024),
            width,
            height,
            originalName: file.name,
          });
        } catch {
          resolve({
            dataUrl: e.target?.result as string,
            sizeKb: Math.round(file.size / 1024),
            width: img.width,
            height: img.height,
            originalName: file.name,
          });
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const formatKb = (kb: number): string => {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
