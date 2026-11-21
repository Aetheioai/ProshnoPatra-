import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === 'card') {
      return (
        <button
          type="button"
          onClick={install}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-md bg-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Smartphone className="w-4 h-4 text-[#0F4C81] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-900">Install ProshnoPatra App</div>
              <div className="text-[11px] text-zinc-500">
                Use offline from your home screen with full-screen workspace
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0F4C81] rounded whitespace-nowrap shrink-0">
            Install
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[36px] text-xs font-semibold text-[#0F4C81] bg-[#F0F6FC] hover:bg-[#E2EFFA] border border-[#0F4C81]/25 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Install ProshnoPatra as an app"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        {variant === 'card' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-md bg-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone className="w-4 h-4 text-[#0F4C81] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900">Install on iPhone / iPad</div>
                <div className="text-[11px] text-zinc-500">
                  Add to Home Screen for offline full-screen use
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-[#0F4C81] whitespace-nowrap shrink-0">
              How to install
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-2.5 min-h-[36px] text-xs font-medium text-zinc-700 border border-zinc-200 hover:border-zinc-400 rounded bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Install</span>
          </button>
        )}

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 no-print"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl bg-white border border-zinc-200 p-5 pb-safe space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-950">
                    Install ProshnoPatra on iOS
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Works offline anytime from your Home Screen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="p-2 text-zinc-400 hover:text-zinc-900 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="space-y-2.5 text-sm text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-zinc-950">
                      <Share className="w-3.5 h-3.5 text-[#0F4C81]" /> Share
                    </span>{' '}
                    button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-zinc-950">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-zinc-950">Add</strong> in the top right corner.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-18 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 flex items-center gap-2 rounded-lg bg-zinc-900 text-white px-3.5 py-2 text-xs font-medium"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Offline mode — your papers save locally on this device.</span>
    </div>
  );
};
