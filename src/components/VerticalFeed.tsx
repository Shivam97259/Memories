import { useState, useRef, useEffect } from 'react';
import { Lock, MoreVertical, Download, Maximize2, Minimize2, X } from 'lucide-react';
import type { VaultPhoto } from '../api.ts';

interface VerticalFeedProps {
  photos: VaultPhoto[];
  onLock: () => void;
}

export function VerticalFeed({ photos, onLock }: VerticalFeedProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fullscreen state observer
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Track currently centered image index using IntersectionObserver
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [photos]);

  // Toggle fullscreen mode
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
    setIsMenuOpen(false);
  };

  // Download centered memory
  const handleDownloadCurrent = () => {
    const activePhoto = photos[currentIndex];
    if (!activePhoto) return;

    const link = document.createElement('a');
    link.href = activePhoto.url;
    link.download = activePhoto.name || `vault-memory-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* High-Contrast Controls in Top-Right */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2.5">
        {/* Panic Lock Button (🔒): Frosted semi-transparent circle button placed directly to the left of 3-dots */}
        <button
          onClick={onLock}
          aria-label="Quick Lock Vault"
          title="Instant Lock"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 backdrop-blur-md border border-white/30 text-rose-300 hover:text-rose-100 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4 text-[#FF4D6D]" />
        </button>

        {/* Three Dots Menu (⋮) */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="More Options"
          title="Menu"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek Frosted Popup Modal for Three Dots Menu (Grid option removed completely) */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-label="Feed Options"
          className="absolute inset-0 z-50 flex items-start justify-end p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="mt-12 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-rose-100/80 p-2 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500">
              <span>Memory Options</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-1 space-y-0.5">
              {/* [📥] Download Active Photo */}
              <button
                onClick={handleDownloadCurrent}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-medium text-slate-700 hover:text-rose-700 transition-colors cursor-pointer text-left"
              >
                <Download className="w-4 h-4 text-rose-500" />
                <span>Download Active Photo</span>
              </button>

              {/* [⛶] Fullscreen Toggle */}
              <button
                onClick={handleToggleFullscreen}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-slate-500" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-slate-500" />
                    <span>Fullscreen Toggle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Reels-Style Vertical Feed: Edge-to-edge full-bleed snap scrolling */}
      <div
        ref={feedContainerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        {photos.map((photo, index) => (
          <div
            key={photo.name + index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            data-index={index}
            className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden"
          >
            {/* Ambient subtle blurred backdrop for cinematic warmth */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125 pointer-events-none transition-opacity"
              style={{ backgroundImage: `url(${photo.url})` }}
              aria-hidden="true"
            />

            {/* Pure image focus: Zero clutter on screen, no captions, no cards, no bottom panels */}
            <img
              src={photo.url}
              alt=""
              loading={Math.abs(index - currentIndex) <= 2 ? 'eager' : 'lazy'}
              className="relative z-10 w-full h-full object-contain max-h-full max-w-full pointer-events-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
