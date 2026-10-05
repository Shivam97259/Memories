import { Lock, Heart } from 'lucide-react';
import type { VaultPhoto } from '../api.ts';

interface GridViewProps {
  photos: VaultPhoto[];
  onSelectPhoto: (photo: VaultPhoto) => void;
  onLock: () => void;
}

export function GridView({
  photos,
  onSelectPhoto,
  onLock,
}: GridViewProps) {
  return (
    <div className="relative w-full h-full bg-[#FAF7F2] bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-amber-50/20 text-slate-800 flex flex-col overflow-y-auto no-scrollbar pb-6">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 w-full backdrop-blur-md bg-white/85 border-b border-rose-100/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D]" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-tight text-slate-800">
              Vault Gallery
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {photos.length} memories preserved
            </p>
          </div>
        </div>

        {/* Panic Lock Button */}
        <button
          onClick={onLock}
          aria-label="Instant Lock"
          title="Lock Vault"
          className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 active:scale-90 border border-rose-200/80 text-[#E11D48] flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Lock className="w-4 h-4" />
        </button>
      </header>

      {/* 2-Column Responsive Grid */}
      <main className="flex-1 w-full p-2.5 sm:p-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {photos.map((photo, index) => (
            <div
              key={photo.name + index}
              onClick={() => onSelectPhoto(photo)}
              className="group relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-rose-100/50 border border-white shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer active:scale-98"
            >
              <img
                src={photo.url}
                alt={photo.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                <span className="text-[10px] font-mono text-white truncate drop-shadow-xs">
                  {photo.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
