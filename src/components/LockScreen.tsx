import { useState, useEffect } from 'react';
import { Delete, Lock, Lightbulb, ShieldCheck, Heart } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

const PASSCODE_LENGTH = 8;
const SECRET_PASSCODE = '29082026';

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showHintToast, setShowHintToast] = useState<boolean>(false);

  // Auto-dismiss hint toast after 3 seconds
  useEffect(() => {
    if (!showHintToast) return;
    const timer = setTimeout(() => {
      setShowHintToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showHintToast]);

  // Handle number input
  const handleDigitPress = (digit: string) => {
    if (pin.length >= PASSCODE_LENGTH) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    // Auto-unlock immediately upon entering the 8th digit
    if (nextPin.length === PASSCODE_LENGTH) {
      if (nextPin === SECRET_PASSCODE) {
        setTimeout(() => {
          onUnlock();
        }, 150);
      } else {
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  // Physical keyboard listener for desktop usability
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="relative w-full h-full min-h-[100dvh] sm:min-h-full flex flex-col justify-between p-6 bg-[#FAF7F2] bg-gradient-to-b from-rose-50 via-pink-50/30 to-amber-50/20 text-slate-800 select-none overflow-hidden">
      {/* Soft romantic ambient background blurs */}
      <div className="absolute top-12 -left-14 w-52 h-52 bg-rose-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 -right-14 w-60 h-60 bg-pink-200/35 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Soft Pastel Badge and Hint Button */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-pink-100/80 shadow-xs text-xs font-medium text-rose-600">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF4D6D]" />
          <span>Private & Encrypted</span>
        </div>

        {/* Top-Right Hint Button */}
        <button
          onClick={() => setShowHintToast(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white active:scale-95 backdrop-blur-md border border-pink-200/70 shadow-xs text-xs font-semibold text-rose-700 transition-all cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40" />
          <span>Hint 💡</span>
        </button>
      </div>

      {/* Floating Hint Frosted Toast */}
      {showHintToast && (
        <div className="absolute top-16 left-6 right-6 z-30 mx-auto max-w-xs animate-bounce duration-300 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-rose-200 shadow-xl shadow-rose-900/10 text-xs sm:text-sm font-medium text-rose-800 flex items-center justify-center gap-2 text-center">
          <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D] shrink-0" />
          <span>The day we first met... 💕 (DDMMYYYY)</span>
        </div>
      )}

      {/* Center Branding & 8 Indicator Dots */}
      <div className="relative z-10 flex flex-col items-center my-auto space-y-4 w-full">
        {/* Soft Pink Rounded Square with Rose-Pink Padlock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/90 border border-pink-100 shadow-sm flex items-center justify-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-100/90 to-pink-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#FF4D6D]" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
            Our Secret Vault 💕
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Enter our 8-digit secret passcode
          </p>
        </div>

        {/* 8 Round Indicator Dots: Soft hollow rings that turn solid rose-pink */}
        <div
          className={`flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-white/80 border border-pink-100 shadow-xs backdrop-blur-md transition-all ${
            isShaking ? 'animate-shake border-rose-400 bg-rose-50/80' : ''
          }`}
        >
          {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => {
            const isFilled = i < pin.length;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#FF4D6D] border-2 border-[#FF4D6D] shadow-sm shadow-rose-400/50 scale-110'
                    : 'bg-white/60 border-2 border-pink-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Keypad Buttons: Clean white rounded cards (0-9, Clear, Delete) */}
      <div className="relative z-10 w-full max-w-xs mx-auto pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitPress(digit)}
              className="h-14 sm:h-16 rounded-2xl bg-white/80 border border-pink-100 shadow-sm text-gray-800 text-xl font-semibold active:scale-95 active:bg-pink-50 transition-all duration-150 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white"
            >
              <span>{digit}</span>
            </button>
          ))}

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="h-14 sm:h-16 rounded-2xl bg-white/70 border border-pink-100 shadow-sm text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 active:scale-95 active:bg-pink-50 transition-all duration-150 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            onClick={() => handleDigitPress('0')}
            className="h-14 sm:h-16 rounded-2xl bg-white/80 border border-pink-100 shadow-sm text-gray-800 text-xl font-semibold active:scale-95 active:bg-pink-50 transition-all duration-150 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            aria-label="Delete last digit"
            className="h-14 sm:h-16 rounded-2xl bg-white/70 border border-pink-100 shadow-sm text-slate-500 hover:text-rose-600 active:scale-95 active:bg-pink-50 transition-all duration-150 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5 text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
