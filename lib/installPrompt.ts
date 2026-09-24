import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only helpers for the "add to home screen" (PWA) flow.
 *
 * Chrome/Edge fire a single `beforeinstallprompt` event shortly after load. We
 * capture it here at module scope (this file is imported from the root layout
 * so it runs before any screen mounts) and replay it when the user taps
 * "Installer". Safari has no such API: iOS users get manual instructions.
 */

export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'native';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function detectInstallPlatform(): InstallPlatform {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'native';
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch points tell it apart.
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

export function isStandalone(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return Platform.OS !== 'web';
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
}

export function useInstallState() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') deferredPrompt = null;
    notify();
    return outcome === 'accepted';
  };

  return {
    platform: detectInstallPlatform(),
    installed: isStandalone(),
    canPrompt: deferredPrompt !== null,
    promptInstall,
  };
}
