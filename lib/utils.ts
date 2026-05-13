import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '昨天';
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

export function formatShortDate(timestamp: number): string {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${min}`;
}

export function groupByDay(items: { createdAt: number }[]): { label: string; items: typeof items }[] {
  const now = new Date();
  const map = new Map<string, { label: string; ts: number; items: typeof items }>();
  for (const item of items) {
    const d = new Date(item.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) {
      const label = diffDays === 0 ? '今天' : diffDays === 1 ? '昨天' : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      map.set(key, { label, ts: item.createdAt, items: [] });
    }
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values()).sort((a, b) => b.ts - a.ts);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function calcVideoCredits(config: { ratio: string; resolution: string; audio: string; duration: number }): number {
  let base = 10;
  if (config.resolution === '1080p') base = 20;
  else if (config.resolution === '720p') base = 15;
  const durationMul = config.duration / 8;
  return parseFloat((base * durationMul * (config.audio === 'on' ? 1.2 : 1)).toFixed(2));
}

export function calcImageCredits(config: { resolution: string }): number {
  if (config.resolution === '4k') return 3.50;
  if (config.resolution === '2k') return 2.20;
  return 1.18;
}
