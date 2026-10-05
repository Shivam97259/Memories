import { X, Download, Maximize2 } from 'lucide-react';
import type { VaultPhoto } from '../api.ts';

interface PhotoLightboxProps {
  photo: VaultPhoto | null;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  if (!photo) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo preview: ${photo.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col bg-[#070c1e]/95 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2 truncate">
            <Maximize2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm font-medium text-slate-200 truncate">{photo.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close photo preview"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image viewport */}
        <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-4 bg-[#030712]/80 overflow-auto">
          <img
            src={photo.url}
            alt={photo.name}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg shadow-black/80"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono truncate">{photo.name}</span>
          {photo.size && (
            <span className="font-mono tabular-nums">
              {(photo.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
