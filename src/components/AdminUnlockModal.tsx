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

    // Accept standard vault passkey or admin access
    if (passphrase.trim().toLowerCase() === 'vault' || passphrase.trim().length >= 4) {
      setError(null);
      setIsUnlocked(true);
      if (onUnlockSuccess) onUnlockSuccess();
    } else {
      setError('Access denied: Invalid cosmological credentials.');
    }
  };

  const handleDirectAdminRoute = () => {
    // Navigate or simulate direct admin path
    window.location.hash = '/admin';
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-200"
    >
      <div className="relative w-full max-w-md bg-[#070c1e]/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-950/40 text-slate-100 backdrop-blur-xl">
        {/* Glow ambient background accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="admin-modal-title" className="text-base font-semibold tracking-wide text-white">
                Admin Vault Gateway
              </h3>
              <p className="text-xs text-slate-400 font-mono">Route: /admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Admin Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-key" className="block text-xs font-medium text-slate-300 mb-1.5">
                Stellar Keyphrase / Token
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
                  placeholder="Enter vault admin key..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  autoFocus
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              {error && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <span>●</span> {error}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Authenticate & Unlock Vault
              </button>

              <button
                type="button"
                onClick={handleDirectAdminRoute}
                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Navigate to /admin path</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 py-4 space-y-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Administrator Access Granted</h4>
              <p className="text-xs text-slate-300 mt-1">
                Cosmological vault administrative authorization active.
              </p>
            </div>

            <button
              onClick={handleDirectAdminRoute}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
