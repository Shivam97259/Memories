/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  FolderArchive,
  RefreshCw,
  AlertCircle,
  HardDrive,
  Github,
  Shield,
  ArrowLeft,
  Heart,
  Smartphone,
  LayoutGrid,
  Plus,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { fetchVaultPhotos, uploadVaultPhoto, type VaultPhoto } from './api';
import { VAULT_CONFIG } from './config';
import { LockScreen } from './components/LockScreen.tsx';
import { VerticalFeed } from './components/VerticalFeed.tsx';
import { GridView } from './components/GridView.tsx';
import { PhotoLightbox } from './components/PhotoLightbox.tsx';

interface ToastState {
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Security & Navigation State (Preserved across lock cycles)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'grid'>('feed');
  const [selectedPhoto, setSelectedPhoto] = useState<VaultPhoto | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>(
    window.location.hash || window.location.pathname
  );

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show auto-dismissing toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch photos on initial load
  const loadVaultPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVaultPhotos((partial) => {
        setPhotos(partial);
      });
      setPhotos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to vault repository.';
      console.error('Vault photo fetch failed:', err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVaultPhotos();
  }, [loadVaultPhotos]);

  // Privacy Shield: Auto-lock on visibilitychange and blur temporarily disabled for testing/development
  // Manual Panic Lock (🔒) remains active via handleLock
  /*
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsUnlocked(false);
      }
    };

    const handleBlur = () => {
      setIsUnlocked(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  */

  // Hash / Route listener for /admin support
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

  const isAdminView = currentRoute === '#/admin' || currentRoute === '/admin';

  // Manual instant lock handler
  const handleLock = () => {
    setIsUnlocked(false);
  };

  // Trigger file picker
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // File chosen handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setUploadFile(file);
      setUploadPreviewUrl(preview);
    }
  };

  // Cancel upload dialog
  const handleCancelUpload = () => {
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }
    setUploadFile(null);
    setUploadPreviewUrl(null);
  };

  // Confirm and upload photo to GitHub
  const handleConfirmUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      await uploadVaultPhoto(uploadFile);
      handleCancelUpload();
      showToast('Memory saved forever! ✨', 'success');
      // Auto-refresh vault photos immediately so new image appears in Feed & Grid
      await loadVaultPhotos();
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Failed to upload. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3EFEA] sm:bg-[#EAE4DC] flex justify-center items-stretch sm:items-center sm:py-6 select-none font-sans">
      {/* Strict Mobile-First Viewport Frame with Soft Ivory Chassis */}
      <div className="w-full max-w-md min-h-[100dvh] h-[100dvh] sm:min-h-[844px] sm:h-[844px] sm:max-h-[92vh] sm:rounded-[42px] sm:border-[9px] sm:border-white sm:ring-1 sm:ring-pink-200/50 bg-[#FAF7F2] shadow-2xl shadow-rose-950/10 relative overflow-hidden flex flex-col text-slate-800">
        
        {/* Floating Feedback Toast */}
        {toastMessage && (
          <div
            role="status"
            className="absolute top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-800 animate-in fade-in slide-in-from-top-3 duration-200 whitespace-nowrap"
          >
            {toastMessage.type === 'success' && <Sparkles className="w-4 h-4 text-rose-500" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Admin Route View */}
        {isAdminView ? (
          <div className="relative z-30 w-full h-full p-5 bg-[#FAF7F2] bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-amber-50/20 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      window.location.hash = '';
                      setCurrentRoute('');
                    }}
                    className="p-1.5 rounded-full bg-white hover:bg-rose-50 border border-rose-200/80 text-rose-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold font-display text-slate-800">
                      Vault Admin Console
                    </h1>
                    <p className="text-[11px] text-slate-500 font-mono">Route: /admin</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Authorized</span>
                </div>
              </div>

              {/* Vault Config Card */}
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-rose-500" />
                  <span>GitHub Integration</span>
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-400">User</dt>
                    <dd className="font-mono text-slate-700 font-medium">{VAULT_CONFIG.githubUsername}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-400">Repo</dt>
                    <dd className="font-mono text-slate-700 font-medium">{VAULT_CONFIG.repoName}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-400">Folder</dt>
                    <dd className="font-mono text-slate-700 font-medium">/{VAULT_CONFIG.folderPath}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-slate-400">Passcode</dt>
                    <dd className="font-mono text-rose-600 font-semibold">29082026</dd>
                  </div>
                </dl>
              </div>

              {/* Telemetry Card */}
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Memory Telemetry</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-rose-600">{photos.length}</span> images loaded via secure Blob URLs. Auto-lock privacy shield active on visibility and blur.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={loadVaultPhotos}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF4D6D] to-[#E11D48] text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resynchronize Vault</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '';
                  setCurrentRoute('');
                }}
                className="w-full py-2 px-3 bg-white/70 hover:bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Return to Gallery
              </button>
            </div>
          </div>
        ) : (
          /* Main Application Container: Kept permanently mounted to preserve active photo & scroll states */
          <div className="w-full h-full flex flex-col overflow-hidden relative">
            {isLoading && photos.length === 0 ? (
              /* Loading State */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#FAF7F2] bg-gradient-to-b from-rose-50/90 to-amber-50/30 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-3 border-rose-200 border-t-[#FF4D6D] animate-spin flex items-center justify-center shadow-xs">
                  <Heart className="w-5 h-5 text-[#FF4D6D] fill-[#FF4D6D]/40" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-800">Opening Our Vault</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Retrieving cherished memories...
                  </p>
                </div>
              </div>
            ) : error && photos.length === 0 ? (
              /* Error State */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#FAF7F2] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-sm font-bold text-slate-800">Connection Error</h3>
                  <p className="text-xs text-rose-600 mt-1 font-mono break-all">{error}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadVaultPhotos}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF4D6D] to-[#E11D48] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleLock}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    Lock Vault
                  </button>
                </div>
              </div>
            ) : photos.length === 0 ? (
              /* Empty Vault State */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#FAF7F2] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Vault is Empty</h3>
                <p className="text-xs text-slate-500">
                  No photos found in repository folder <code className="text-rose-600">/{VAULT_CONFIG.folderPath}</code>.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleOpenFileDialog}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF4D6D] to-[#E11D48] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Upload First Photo
                  </button>
                  <button
                    onClick={handleLock}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Lock Vault
                  </button>
                </div>
              </div>
            ) : (
              /* Tabbed Architecture: Feed & Grid Remain Mounted in DOM Across Lock/Unlock */
              <div className="w-full h-full flex flex-col overflow-hidden relative">
                {/* View Container with Isolated DOMs (Scroll offsets remain 100% frozen when locked) */}
                <div className="flex-1 relative w-full h-[calc(100%-3.5rem)] overflow-hidden">
                  {/* Tab 1: Vertical Snap Feed */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-150 ${
                      activeTab === 'feed'
                        ? 'opacity-100 pointer-events-auto z-10'
                        : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    <VerticalFeed photos={photos} onLock={handleLock} />
                  </div>

                  {/* Tab 2: 2-Column Gallery Grid */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-150 ${
                      activeTab === 'grid'
                        ? 'opacity-100 pointer-events-auto z-10'
                        : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    <GridView
                      photos={photos}
                      onSelectPhoto={(photo) => setSelectedPhoto(photo)}
                      onLock={handleLock}
                    />
                  </div>

                  {/* Floating Action Button (+): Soft romantic pastel rose theme neatly placed above navigation bar */}
                  <button
                    onClick={handleOpenFileDialog}
                    aria-label="Upload New Memory"
                    title="Add Memory"
                    className="absolute bottom-4 right-4 z-30 w-12 h-12 flex items-center justify-center bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-lg shadow-rose-500/40 rounded-full transition-all cursor-pointer border border-white/40"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Fixed Sleek Frosted Bottom Navigation Bar */}
                <nav className="h-14 w-full bg-white/80 backdrop-blur-md border-t border-pink-100 py-2 px-6 flex justify-around items-center z-40 select-none shrink-0 shadow-xs">
                  {/* Tab 1: [📱 Feed] */}
                  <button
                    onClick={() => setActiveTab('feed')}
                    aria-label="Feed Tab"
                    className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                      activeTab === 'feed'
                        ? 'text-rose-600 font-bold'
                        : 'text-gray-400 hover:text-gray-600 font-medium'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-[11px]">Feed</span>
                  </button>

                  {/* Tab 2: [▦ Grid] */}
                  <button
                    onClick={() => setActiveTab('grid')}
                    aria-label="Grid Tab"
                    className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                      activeTab === 'grid'
                        ? 'text-rose-600 font-bold'
                        : 'text-gray-400 hover:text-gray-600 font-medium'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[11px]">Grid</span>
                  </button>
                </nav>

                {/* Dedicated Lightbox Modal for Grid View with Panic Lock */}
                <PhotoLightbox
                  photo={selectedPhoto}
                  onClose={() => setSelectedPhoto(null)}
                  onLock={handleLock}
                />

                {/* Upload Preview & Confirmation Modal */}
                {uploadFile && uploadPreviewUrl && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Upload Confirmation"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => !isUploading && handleCancelUpload()}
                  >
                    <div
                      className="relative max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-rose-100 shadow-2xl text-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-rose-100/70">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D]" />
                          <h3 className="text-sm font-bold text-slate-800 font-display">New Memory</h3>
                        </div>
                        {!isUploading && (
                          <button
                            onClick={handleCancelUpload}
                            aria-label="Cancel Upload"
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Image Thumbnail Preview */}
                      <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <img
                          src={uploadPreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-center px-1">
                        <p className="text-xs font-semibold text-slate-700 truncate max-w-full">
                          {uploadFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          {(uploadFile.size / 1024).toFixed(0)} KB • Ready to commit to our vault
                        </p>
                      </div>

                      {/* Confirm & Cancel Buttons */}
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handleConfirmUpload}
                          disabled={isUploading}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF4D6D] to-[#E11D48] hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Saving memory to vault... ⏳</span>
                            </>
                          ) : (
                            <>
                              <Heart className="w-3.5 h-3.5 fill-white text-white" />
                              <span>Save Memory to Vault 💕</span>
                            </>
                          )}
                        </button>

                        {!isUploading && (
                          <button
                            onClick={handleCancelUpload}
                            className="w-full py-2 px-3 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lock Screen Overlay: Full-bleed overlay that does NOT unmount the underlying Feed or Grid */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-50 w-full h-full bg-[#FAF7F2] animate-in fade-in duration-200">
                <LockScreen onUnlock={() => setIsUnlocked(true)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
