import { DeviceProfile } from '@/types/storage';
import { setDeviceProfile, getDeviceProfile } from './storage';

export async function detectDevice(): Promise<DeviceProfile> {
  const cached = getDeviceProfile();
  if (cached) return cached;

  const storageEstimate = await (async () => {
    if (!navigator.storage?.estimate) return { usage: 0, quota: 0 };
    try {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    } catch { return { usage: 0, quota: 0 }; }
  })();

  const profile: DeviceProfile = {
    ram:         (navigator as { deviceMemory?: number }).deviceMemory ?? null,
    cores:       navigator.hardwareConcurrency ?? 1,
    webgpu:      'gpu' in navigator,
    wasm:        typeof WebAssembly === 'object',
    connection:  (navigator as { connection?: { effectiveType: string } }).connection?.effectiveType ?? null,
    isMobile:    /Mobi|Android/i.test(navigator.userAgent),
    storageQuota: storageEstimate.quota,
    storageUsage: storageEstimate.usage,
    detectedAt:  new Date().toISOString(),
  };

  setDeviceProfile(profile);
  return profile;
}

export function canRunPython(profile: DeviceProfile): boolean {
  return profile.wasm && (profile.ram === null || profile.ram >= 2);
}

export function canRunLocalAI(profile: DeviceProfile): boolean {
  return profile.wasm && (profile.ram === null || profile.ram >= 1);
}

export function canRunLargeAI(profile: DeviceProfile): boolean {
  return profile.webgpu && (profile.ram === null || profile.ram >= 4);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
