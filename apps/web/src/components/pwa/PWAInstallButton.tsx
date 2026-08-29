"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(!!isStandaloneMode);
    if (isStandaloneMode) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("PWA SW registration error:", err);
      });
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) return null;

  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            setIsInstallable(false);
          }
          setDeferredPrompt(null);
        }}
        title="Install App"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[var(--secondary)] border border-[var(--border)] rounded-md transition-colors hover:text-white hover:border-white uppercase tracking-wider"
      >
        <Download className="w-3 h-3" />
        <span className="hidden md:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="relative flex flex-col items-start">
        <button
          onClick={() => setShowIOSHint(!showIOSHint)}
          title="Install iOS App"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[var(--secondary)] border border-[var(--border)] rounded-md transition-colors hover:text-white hover:border-white uppercase tracking-wider"
        >
          <Download className="w-3 h-3" />
          <span className="hidden md:inline">Install App</span>
        </button>
        {showIOSHint && (
          <div className="absolute top-full left-0 mt-2 w-52 p-2.5 text-[11px] leading-tight bg-[var(--elevated)] border border-[var(--border)] rounded-md text-white shadow-xl z-50">
            To install Global Chanakya, tap <strong>Share</strong> and select <strong>Add to Home Screen</strong>.
          </div>
        )}
      </div>
    );
  }

  return null;
}

