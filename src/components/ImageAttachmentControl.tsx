import React, { useRef } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ImagePlus, Trash2 } from 'lucide-react';
import { AttachedImage } from '../types/paper';

interface ImageAttachmentControlProps {
  image?: AttachedImage;
  onChange: (img?: AttachedImage) => void;
  label?: string;
  compact?: boolean;
}

function readAndOptimizeImage(file: File, maxDimension = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      // Keep SVG or tiny PNGs lossless
      if (file.type === 'image/svg+xml' || file.size < 120 * 1024) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, 0.88));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const ImageAttachmentControl: React.FC<ImageAttachmentControlProps> = ({
  image,
  onChange,
  label = 'Attach Diagram / Image',
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const src = await readAndOptimizeImage(file);
      onChange({
        src,
        width: image?.width ?? (compact ? 45 : 55),
        align: image?.align ?? 'center',
        caption: image?.caption ?? '',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!image ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 py-1 px-2 border border-dashed border-zinc-300 hover:border-zinc-500 rounded transition-colors cursor-pointer"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ) : (
        <div className="border border-zinc-200 rounded bg-zinc-50/70 p-2.5 space-y-2.5">
          <div className="flex items-start gap-3">
            <img
              src={image.src}
              alt={image.caption || 'Attached diagram'}
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain bg-white border border-zinc-200 rounded shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-zinc-500 whitespace-nowrap">
                    Width: <span className="font-mono-num text-zinc-800">{image.width}%</span>
                  </label>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={5}
                    value={image.width}
                    onChange={(e) => onChange({ ...image, width: Number(e.target.value) })}
                    className="w-24 accent-zinc-900 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => {
                    const Icon =
                      align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                    return (
                      <button
                        key={align}
                        type="button"
                        title={`Align ${align}`}
                        onClick={() => onChange({ ...image, align })}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          image.align === align
                            ? 'bg-zinc-900 text-white'
                            : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-1 text-[11px] text-zinc-600 hover:text-zinc-900 px-1.5 py-0.5 border border-zinc-200 bg-white rounded cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    title="Remove image"
                    onClick={() => onChange(undefined)}
                    className="p-1 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!compact && (
                <input
                  type="text"
                  value={image.caption ?? ''}
                  onChange={(e) => onChange({ ...image, caption: e.target.value })}
                  placeholder="Optional figure caption (e.g. চিত্র-১ / Fig. 1)"
                  className="w-full text-xs px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-800 placeholder:text-zinc-400"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
