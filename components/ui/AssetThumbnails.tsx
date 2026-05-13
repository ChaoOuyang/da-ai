'use client';
import { X, Play, Music } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { Asset } from '@/lib/types';

interface AssetThumbnailsProps {
  assets: Asset[];
  onRemove?: (id: string) => void;
  size?: 'sm' | 'md';
}

export default function AssetThumbnails({ assets, onRemove, size = 'md' }: AssetThumbnailsProps) {
  if (assets.length === 0) return null;
  const dim = size === 'sm' ? 'w-14 h-14' : 'w-20 h-20';
  return (
    <div className="flex flex-wrap gap-2">
      {assets.map((a) => (
        <div key={a.id} className={cn('relative rounded-lg overflow-hidden bg-slate-100 shrink-0 group', dim)}>
          {a.type === 'image' ? (
            <img src={a.thumbnailUrl} alt={a.name} className="w-full h-full object-cover" />
          ) : a.type === 'video' ? (
            <>
              <img src={a.thumbnailUrl} alt={a.name} className="w-full h-full object-cover" />
              <Play size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
              {a.duration && <span className="absolute bottom-0.5 left-0.5 text-xs text-white bg-black/60 px-1 rounded">{formatDuration(a.duration)}</span>}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={18} className="text-slate-400" />
            </div>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(a.id)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
            >
              <X size={10} className="text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
