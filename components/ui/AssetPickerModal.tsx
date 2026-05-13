'use client';
import { useState, useMemo } from 'react';
import { Search, Image, Video, Music, Upload, Link, Check, Play } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useStore } from '@/lib/store';
import { cn, formatDuration } from '@/lib/utils';
import type { Asset } from '@/lib/types';

interface AssetPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (assets: Asset[]) => void;
  maxCount?: number;
  selectedIds?: string[];
}

export default function AssetPickerModal({ open, onClose, onConfirm, maxCount = 12, selectedIds = [] }: AssetPickerModalProps) {
  const { assets } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'upload' | 'ai-generated'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  const filtered = useMemo(() => {
    return assets.items.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (sourceFilter !== 'all' && a.source !== sourceFilter) return false;
      if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [assets.items, typeFilter, sourceFilter, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxCount) {
        next.add(id);
      }
      return next;
    });
  }

  function handleConfirm() {
    const items = assets.items.filter((a) => selected.has(a.id));
    onConfirm(items);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="选择参考素材" size="xl">
      <div className="flex flex-col" style={{ height: '70vh' }}>
        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {(['all', 'image', 'video', 'audio'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all', typeFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900')}
                >
                  {{ all: '全部', image: '图片', video: '视频', audio: '音频' }[t]}
                </button>
              ))}
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
              className="bg-white text-slate-700 text-sm rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">全部来源</option>
              <option value="upload">我上传的</option>
              <option value="ai-generated">AI 生成的</option>
            </select>
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索素材..."
                className="w-full bg-white text-slate-900 text-sm rounded-lg pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Image size={40} className="mb-3 opacity-30" />
              <p>暂无素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((asset) => {
                const isSelected = selected.has(asset.id);
                return (
                  <button
                    key={asset.id}
                    onClick={() => toggle(asset.id)}
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden border-2 transition-all group',
                      isSelected ? 'border-indigo-500' : 'border-transparent hover:border-slate-500'
                    )}
                  >
                    {asset.type === 'image' ? (
                      <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                    ) : asset.type === 'video' ? (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center relative">
                        <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                        <Play size={20} className="absolute text-white drop-shadow" />
                        {asset.duration && (
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatDuration(asset.duration)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                        <Music size={24} className="text-slate-400" />
                        {asset.duration && <span className="text-slate-400 text-xs">{formatDuration(asset.duration)}</span>}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{asset.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex gap-3">
            <Button variant="ghost" size="sm">
              <Upload size={14} />上传文件
            </Button>
            <Button variant="ghost" size="sm">
              <Link size={14} />链接导入
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">已选 {selected.size}/{maxCount}</span>
            <Button variant="primary" onClick={handleConfirm} disabled={selected.size === 0}>
              确认添加
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
