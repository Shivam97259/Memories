/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import {
  FolderArchive,
  RefreshCw,
  Lock,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  HardDrive,
  Github,
  ChevronRight,
  Shield,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { fetchVaultPhotos, type VaultPhoto } from './api.ts';
import { VAULT_CONFIG } from './config.ts';
import { StarfieldCanvas } from './components/StarfieldCanvas.tsx';
import { AdminUnlockModal } from './components/AdminUnlockModal.tsx';
import { PhotoLightbox } from './components/PhotoLightbox.tsx';

export default function App() {
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<VaultPhoto | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>(
    window.location.hash || window.location.pathname
  );

  // Sync hash routing for /admin support
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(window.location.hash || window.location.pathname);
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Primary loader function
  const loadVaultPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVaultPhotos();
      setPhotos(data);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown cosmological fetch error.';
      console.error('Vault photo fetch failed:', err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVaultPhotos();
  }, [loadVaultPhotos]);

  const isAdminView = currentRoute === '#/admin' || currentRoute === '/admin';

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Three.js Deep Space Starfield Canvas */}
      <StarfieldCanvas particleCount={1600} speed={0.0005} />

      {/* Top Bar Navigation Contract: 3 zones (Brand, Nav Links, Actions) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030712]/75 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FolderArchive className="w-4 h-4 text-white" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '';
                setCurrentRoute('');
              }}
              className="font-display text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
            >
              Our Little Vault
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a
              href="#vault"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '';
                setCurrentRoute('');
              }}
              className="text-white hover:text-cyan-400 transition-colors"
            >
              Vault Archive
            </a>
            <a
              href="#configuration"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Deep Space Config
            </a>
            <a
              href="#telemetry"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Cosmic Ledger
            </a>
          </nav>

          {/* Zone 3: Actions including mandatory Admin Unlock Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadVaultPhotos}
              disabled={isLoading}
              title="Refresh Vault Photos"
              className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Core Rule: Retain the admin unlock button for /admin */}
            <button
              id="admin-unlock-button"
              onClick={() => setIsAdminModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-cyan-200 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg transition-all shadow-sm shadow-cyan-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="whitespace-nowrap">Admin Unlock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isAdminView ? (
          /* Admin View for /admin */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    window.location.hash = '';
                    setCurrentRoute('');
                  }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold font-display text-white">
                    Cosmological Admin Console
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">Location: /admin</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5" />
                <span>Authorized Vault Session</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vault Config Card */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  GitHub Repository Configuration
                </h3>
                <dl className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <dt className="text-slate-400">User</dt>
                    <dd className="font-mono text-cyan-300">{VAULT_CONFIG.githubUsername}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <dt className="text-slate-400">Repository</dt>
                    <dd className="font-mono text-cyan-300">{VAULT_CONFIG.repoName}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <dt className="text-slate-400">Folder Path</dt>
                    <dd className="font-mono text-cyan-300">{VAULT_CONFIG.folderPath}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <dt className="text-slate-400">Target Branch</dt>
                    <dd className="font-mono text-cyan-300">{VAULT_CONFIG.branch}</dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="text-slate-400">Auth Token Verification</dt>
                    <dd className="font-mono text-emerald-400">
                      {VAULT_CONFIG.githubToken ? 'Active & Configured' : 'Missing'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Status & Operations Card */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-violet-400" />
                    Storage & Cache Statistics
                  </h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>Current vault contains <span className="text-cyan-400 font-semibold">{photos.length}</span> images rendered via secure client-side Blob URLs.</p>
                    <p>Direct GitHub raw stream proxying prevents exposure of authorization headers to static asset servers.</p>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    onClick={loadVaultPhotos}
                    disabled={isLoading}
                    className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Synchronize Vault</span>
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = '';
                      setCurrentRoute('');
                    }}
                    className="py-2 px-4 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Return to Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Vault View */
          <div className="space-y-10">
            {/* Hero / Overview Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070e24]/90 via-[#0a0f2c]/80 to-[#050817]/95 border border-cyan-500/20 p-6 sm:p-10 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Stellar Repository Ledger</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">
                    {VAULT_CONFIG.githubUsername}/{VAULT_CONFIG.repoName}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                  Our Little Vault
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Deep space archive powered by private GitHub raw blob streaming. Connects securely to the
                  celestial repository and presents photos with cosmological zero-latency loading.
                </p>

                {/* Verification & Live Status Bar */}
                <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Status:</span>
                    {isLoading ? (
                      <span className="text-cyan-400 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Fetching files...
                      </span>
                    ) : error ? (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Sync Error
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected ({photos.length} photos)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Branch:</span>
                    <span className="text-cyan-300">{VAULT_CONFIG.branch}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Path:</span>
                    <span className="text-slate-300">/{VAULT_CONFIG.folderPath}</span>
                  </div>

                  {lastUpdated && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Synchronized:</span>
                      <span className="text-slate-300">
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Notification Banner if fetch fails */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl p-5 bg-rose-950/40 border border-rose-500/40 text-rose-200 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-rose-100">Cosmological Fetch Error</h4>
                    <p className="text-xs text-rose-300/90 mt-1 font-mono break-all">{error}</p>
                  </div>
                </div>
                <button
                  onClick={loadVaultPhotos}
                  className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-500/50 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Photo Gallery Grid / Verification Display */}
            <section id="vault" className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold font-display text-white">Stellar Gallery</h2>
                  <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/30 rounded-full tabular-nums">
                    {photos.length} items
                  </span>
                </div>

                <button
                  onClick={loadVaultPhotos}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>

              {/* Loading Skeleton */}
              {isLoading && photos.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-slate-900/40 border border-white/5 overflow-hidden animate-pulse h-64 flex flex-col justify-end p-4"
                    >
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && photos.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No images found in vault</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    The GitHub repository folder <code className="text-cyan-300">/{VAULT_CONFIG.folderPath}</code> on branch <code className="text-cyan-300">{VAULT_CONFIG.branch}</code> contains no matching image files.
                  </p>
                  <button
                    onClick={loadVaultPhotos}
                    className="mt-2 px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Check Again
                  </button>
                </div>
              )}

              {/* Photos Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.name + index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-950/40 transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-4/3 w-full bg-[#02050e] overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5">
                          <span className="text-xs text-cyan-300 flex items-center gap-1 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Photo
                          </span>
                          <ChevronRight className="w-4 h-4 text-cyan-400" />
                        </div>
                      </div>

                      {/* Photo Details Footer */}
                      <div className="p-3.5 bg-slate-900/80 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                          {photo.name}
                        </span>
                        {photo.size && (
                          <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0 ml-2">
                            {(photo.size / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Repository Info & Ledger Footer */}
            <section
              id="configuration"
              className="rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl p-6 sm:p-8"
            >
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Github className="w-4 h-4 text-cyan-400" />
                Active Vault Integration
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Connected to remote repository repository source. Verified authentication stream active.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-slate-400 text-[11px]">Owner</div>
                  <div className="text-cyan-300 font-semibold mt-1">{VAULT_CONFIG.githubUsername}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-slate-400 text-[11px]">Repository</div>
                  <div className="text-cyan-300 font-semibold mt-1">{VAULT_CONFIG.repoName}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-slate-400 text-[11px]">Directory</div>
                  <div className="text-cyan-300 font-semibold mt-1">/{VAULT_CONFIG.folderPath}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-slate-400 text-[11px]">Branch</div>
                  <div className="text-cyan-300 font-semibold mt-1">{VAULT_CONFIG.branch}</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Admin Unlock Modal */}
      <AdminUnlockModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onUnlockSuccess={() => {
          window.location.hash = '/admin';
          setCurrentRoute('#/admin');
        }}
      />

      {/* Photo Lightbox */}
      <PhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#030712]/90 backdrop-blur-md py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Our Little Vault · Cosmological Deep Space Archive</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Gateway</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Refreshed Real-Time</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
