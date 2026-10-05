import { X, Download, Heart, Lock } from 'lucide-react';
import type { VaultPhoto } from '../api.ts';

interface PhotoLightboxProps {
  photo: VaultPhoto | null;
  onClose: () => void;
  onLock?: () => void;
}

export function PhotoLightbox({ photo, onClose, onLock }: PhotoLightboxProps) {
  if (!photo) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.name || 'vault-memory.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePanicLock = () => {
    onClose();
    if (onLock) {
      onLock();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Memory view: ${photo.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm sm:max-w-md w-full max-h-[92vh] flex flex-col bg-white/95 rounded-3xl overflow-hidden shadow-2xl border border-rose-100/90 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100 bg-white/90">
          <div className="flex items-center gap-2 truncate">
            <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D] shrink-0" />
            <span className="text-xs font-semibold text-slate-700 truncate">
              {photo.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>Save</span>
            </button>

            {/* Quick Panic Lock Button (🔒) */}
            <button
              onClick={handlePanicLock}
              aria-label="Quick Lock Vault"
              title="Instant Lock"
              className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 active:bg-rose-200 active:scale-90 border border-rose-200/80 text-[#E11D48] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Preview"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full Image Presentation */}
        <div className="relative flex-1 min-h-[320px] max-h-[70vh] bg-black/95 flex items-center justify-center p-2 overflow-hidden">
          {/* Subtle ambient blurred background */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${photo.url})` }}
            aria-hidden="true"
          />
          <img
            src={photo.url}
            alt={photo.name}
            className="relative z-10 max-h-[66vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-rose-50/50 border-t border-rose-100/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="truncate">{photo.name}</span>
          {photo.size && (
            <span className="font-mono tabular-nums text-slate-400 shrink-0 ml-2">
              {(photo.size / 1024).toFixed(0)} KB
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
