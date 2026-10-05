import { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, X, Sparkles, ExternalLink } from 'lucide-react';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess?: () => void;
}

export function AdminUnlockModal({ isOpen, onClose, onUnlockSuccess }: AdminUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setError('Please provide an authorization passkey or token.');
      return;
    }

    if (passphrase.trim().toLowerCase() === 'vault' || passphrase.trim().length >= 4) {
      setError(null);
      setIsUnlocked(true);
      if (onUnlockSuccess) onUnlockSuccess();
    } else {
      setError('Access denied: Invalid credentials.');
    }
  };

  const handleDirectAdminRoute = () => {
    window.location.hash = '/admin';
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
    >
      <div className="relative w-full max-w-sm bg-white/95 border border-rose-100 rounded-3xl p-6 shadow-2xl text-slate-800 backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-[#E11D48]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="admin-modal-title" className="text-sm font-bold tracking-tight text-slate-800">
                Admin Vault Gateway
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">Route: /admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Admin Modal"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="admin-key" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Admin Keyphrase / Token
              </label>
              <div className="relative">
                <input
                  id="admin-key"
                  type="password"
                  value={passphrase}
                  onChange={(e) => {
                    setPassphrase(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter admin key..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors"
                  autoFocus
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {error && (
                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <span>●</span> {error}
                </p>
              )}
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF4D6D] to-[#E11D48] hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Authenticate & Unlock Vault
              </button>

              <button
                type="button"
                onClick={handleDirectAdminRoute}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Navigate to /admin path</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 py-3 space-y-3.5 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Admin Authorization Granted</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Vault administrator session active.
              </p>
            </div>

            <button
              onClick={handleDirectAdminRoute}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to /admin Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
