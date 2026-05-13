'use client';
import { useState, useMemo, useRef } from 'react';
import {
  Plus, Search, Grid2X2, Image as ImageIcon, Video, Music,
  Upload, MoreHorizontal, Play, Download, Trash2, Move,
  Check, FolderPlus, ChevronDown, Link as LinkIcon,
} from 'lucide-react';
import { cn, formatSize, formatShortDate, groupByDay, uid } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Asset } from '@/lib/types';

// ─── Library Card ─────────────────────────────────────────────────────────────
function LibraryCard({ name, isDefault, count, active, coverUrl, onClick, onRename, onDelete }: {
  name: string; isDefault: boolean; count: number; active: boolean;
  coverUrl?: string; onClick: () => void;
  onRename?: () => void; onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn('relative cursor-pointer group shrink-0', active && 'opacity-100')}
      style={{ width: 130 }}
      onClick={onClick}
    >
      {/* Cover */}
      <div className={cn(
        'w-full rounded-2xl overflow-hidden transition-all',
        active ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200 hover:ring-slate-300',
      )} style={{ height: 100 }}>
        {coverUrl
          ? <img src={coverUrl} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <ImageIcon size={28} strokeWidth={1} className="text-slate-300" />
            </div>
        }
      </div>
      {/* Label */}
      <div className="mt-2 flex items-center gap-1">
        {isDefault && <span className="text-[10px] text-slate-400 shrink-0">默认</span>}
        <span className={cn('text-sm font-medium truncate', active ? 'text-slate-900' : 'text-slate-600')}>{name}</span>
      </div>

      {/* Options — non-default only */}
      {!isDefault && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-6 h-6 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white transition-all"
          >
            <MoreHorizontal size={12} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-28 z-30"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onRename?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">重命名</button>
              <button onClick={() => { onDelete?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">删除</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────
function AssetCard({ asset, selected, onSelect, onDelete, onMove }: {
  asset: Asset; selected: boolean;
  onSelect: () => void; onDelete: () => void; onMove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden cursor-pointer group transition-all bg-white',
        selected ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-sm')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMenuOpen(false); }}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="bg-slate-50 flex items-center justify-center relative overflow-hidden" style={{ height: 180 }}>
        {asset.type === 'image' ? (
          <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
        ) : asset.type === 'video' ? (
          <>
            <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play size={22} className="text-white drop-shadow" fill="white" />
            </div>
            {asset.duration && (
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                {Math.floor(asset.duration / 60)}:{String(asset.duration % 60).padStart(2, '0')}
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Music size={32} strokeWidth={1.5} />
            {asset.duration && <span className="text-xs text-slate-400">{asset.duration}s</span>}
          </div>
        )}

        {/* Type badge for audio */}
        {asset.type === 'audio' && (
          <span className="absolute top-2 right-2 bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">音频</span>
        )}

        {/* Checkbox */}
        {(hover || selected) && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={cn('absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center transition-all border-2',
              selected ? 'bg-slate-900 border-slate-900' : 'bg-black/30 border-white/70 hover:border-white')}
          >
            {selected && <Check size={11} className="text-white" />}
          </button>
        )}

        {/* Options */}
        {hover && (
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-6 h-6 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white transition-all"
            >
              <MoreHorizontal size={12} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-32 z-20"
                onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => { e.stopPropagation(); toast.success('已下载'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Download size={12} />下载
                </button>
                <button onClick={(e) => { e.stopPropagation(); onMove(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Move size={12} />移动到
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                  <Trash2 size={12} />删除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-slate-700 truncate font-medium leading-tight">{asset.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{asset.source === 'ai-generated' ? 'AI生成' : '本地上传'}</p>
        </div>
        <span className="text-xs text-slate-400 shrink-0 mt-0.5">{formatShortDate(asset.createdAt)}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const { assets, addLibrary, removeLibrary, renameLibrary, setCurrentLibrary, setAssetFilter, addAsset, removeAsset, moveAssets } = useStore();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLibId, setDeleteLibId] = useState<string | null>(null);
  const [showNewLib, setShowNewLib] = useState(false);
  const [newLibName, setNewLibName] = useState('');
  const [renameLibId, setRenameLibId] = useState<string | null>(null);
  const [renameLibName, setRenameLibName] = useState('');
  const [moveAssetIds, setMoveAssetIds] = useState<string[]>([]);
  const [batchMoveTarget, setBatchMoveTarget] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLibId = assets.currentLibraryId;
  const filters = assets.filters;

  const filteredAssets = useMemo(() => {
    return assets.items.filter((a) => {
      const inLib = currentLibId === 'default' || a.libraryId === currentLibId;
      if (!inLib) return false;
      if (filters.type !== 'all' && a.type !== filters.type) return false;
      if (filters.source !== 'all' && a.source !== filters.source) return false;
      if (filters.query && !a.name.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    });
  }, [assets.items, currentLibId, filters]);

  const groups = useMemo(() => groupByDay(filteredAssets), [filteredAssets]);

  // Library covers: first image asset in each lib
  function getLibCover(libId: string) {
    const img = assets.items.find((a) => (libId === 'default' || a.libraryId === libId) && a.type === 'image');
    return img?.thumbnailUrl;
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleUpload(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio';
      const url = URL.createObjectURL(file);
      addAsset({
        id: uid(), name: file.name, type, url,
        thumbnailUrl: type === 'image' ? url : '',
        format: file.name.split('.').pop() ?? '',
        size: file.size, source: 'upload', tags: [],
        libraryId: currentLibId === 'default' ? 'default' : currentLibId,
        createdAt: Date.now(),
      });
    });
    toast.success(`已上传 ${files.length} 个文件`);
  }

  function handleUrlImport() {
    if (!importUrl.trim()) return;
    const ext = importUrl.split('.').pop()?.toLowerCase() ?? '';
    const type = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' as const
      : ['mp4', 'mov', 'webm'].includes(ext) ? 'video' as const : 'audio' as const;
    addAsset({
      id: uid(), name: importUrl.split('/').pop() ?? '导入文件',
      type, url: importUrl, thumbnailUrl: type === 'image' ? importUrl : '',
      format: ext, size: 0, source: 'upload', tags: [],
      libraryId: currentLibId === 'default' ? 'default' : currentLibId,
      createdAt: Date.now(),
    });
    toast.success('已导入'); setImportUrl(''); setShowUrlImport(false);
  }

  function handleBatchMove() {
    if (!batchMoveTarget || moveAssetIds.length === 0) return;
    moveAssets(moveAssetIds, batchMoveTarget);
    toast.success(`已移动 ${moveAssetIds.length} 个素材`);
    setMoveAssetIds([]); setBatchMoveTarget(''); setSelected(new Set());
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">

      {/* ── 顶部标题 ── */}
      <div className="px-8 pt-7 pb-0 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">我的资产</h1>

        {/* ── 资产库标题 + 操作 ── */}
        <div className="flex items-end justify-between mt-6 mb-4">
          <div>
            <p className="text-base font-semibold text-slate-800">我的资产库</p>
            <p className="text-sm text-slate-400 mt-0.5">管理虚拟人像、真人人像与普通分组素材。</p>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium transition-all"
            >
              <Upload size={13} />上传
            </button>
            <button
              onClick={() => setShowUrlImport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm transition-all"
            >
              <LinkIcon size={13} />链接导入
            </button>
          </div>
        </div>

        {/* ── 库卡片横排 ── */}
        <div className="flex items-start gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {/* 新建库 */}
          <div
            className="relative shrink-0 cursor-pointer"
            style={{ width: 130 }}
            onClick={() => setShowNewLib(true)}
          >
            <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 flex items-center justify-center transition-all bg-slate-50 hover:bg-slate-100"
              style={{ height: 100 }}>
              <Plus size={24} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-500 text-center">新建资产库</p>
          </div>

          {/* 已有库 */}
          {assets.libraries.map((lib) => (
            <LibraryCard
              key={lib.id}
              name={lib.name}
              isDefault={lib.isDefault}
              count={lib.count}
              active={lib.id === currentLibId}
              coverUrl={getLibCover(lib.id)}
              onClick={() => setCurrentLibrary(lib.id)}
              onRename={() => { setRenameLibId(lib.id); setRenameLibName(lib.name); }}
              onDelete={() => setDeleteLibId(lib.id)}
            />
          ))}
        </div>

        {/* ── 筛选栏 ── */}
        <div className="flex items-center gap-3 py-4 border-t border-slate-100">
          {/* 类型 tabs */}
          <div className="flex items-center gap-1">
            {([
              { key: 'all', label: '全部', icon: <Grid2X2 size={13} /> },
              { key: 'image', label: '图片', icon: <ImageIcon size={13} /> },
              { key: 'video', label: '视频', icon: <Video size={13} /> },
              { key: 'audio', label: '音频', icon: <Music size={13} /> },
            ] as const).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setAssetFilter({ type: key })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                  filters.type === key
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* 来源下拉 */}
          <div className="relative">
            <select
              value={filters.source}
              onChange={(e) => setAssetFilter({ source: e.target.value as typeof filters.source })}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="all">全部来源</option>
              <option value="upload">本地上传</option>
              <option value="ai-generated">AI 生成</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* 搜索 */}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.query}
              onChange={(e) => setAssetFilter({ query: e.target.value })}
              placeholder="关键词搜索"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-white focus:outline-none focus:border-slate-400 w-44"
            />
          </div>
        </div>
      </div>

      {/* ── 素材网格 ── */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <ImageIcon size={44} strokeWidth={1} className="text-slate-300" />
            <p className="text-sm">{filters.query ? '未找到匹配素材' : '暂无素材，点击上传'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{group.label}</h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {/* 上传占位卡（仅今天分组第一个） */}
                  {group.label === '今天' && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-all bg-white"
                      style={{ height: 230 }}
                    >
                      <Plus size={24} strokeWidth={1.5} />
                      <span className="text-sm">添加</span>
                    </div>
                  )}
                  {(group.items as Asset[]).map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selected.has(asset.id)}
                      onSelect={() => toggleSelect(asset.id)}
                      onDelete={() => setDeleteId(asset.id)}
                      onMove={() => setMoveAssetIds([asset.id])}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 批量操作栏 ── */}
      {selected.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30">
          <span className="text-sm text-slate-700">已选 <strong>{selected.size}</strong> 个</span>
          <div className="w-px h-4 bg-slate-200" />
          <button onClick={() => setMoveAssetIds(Array.from(selected))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-all">
            <Move size={13} />移动到
          </button>
          <button onClick={() => toast.success(`已下载 ${selected.size} 个素材`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-all">
            <Download size={13} />下载
          </button>
          <button
            onClick={() => { if (window.confirm(`确认删除 ${selected.size} 个素材？`)) { Array.from(selected).forEach((id) => removeAsset(id)); setSelected(new Set()); toast.success('已删除'); } }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-sm transition-all">
            <Trash2 size={13} />删除
          </button>
          <button onClick={() => setSelected(new Set())} className="text-slate-400 hover:text-slate-700 transition-colors text-sm">取消</button>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden"
        onChange={(e) => handleUpload(e.target.files)} />

      {/* Move modal */}
      <Modal open={moveAssetIds.length > 0} onClose={() => setMoveAssetIds([])} title="移动到资产库" size="sm">
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            {assets.libraries.filter((l) => !l.isDefault).map((lib) => (
              <button key={lib.id} onClick={() => setBatchMoveTarget(lib.id)}
                className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all',
                  batchMoveTarget === lib.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50')}>
                {lib.name}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setMoveAssetIds([]); setBatchMoveTarget(''); }}>取消</Button>
            <Button variant="primary" onClick={handleBatchMove} disabled={!batchMoveTarget}>移动</Button>
          </div>
        </div>
      </Modal>

      {/* New library modal */}
      <Modal open={showNewLib} onClose={() => { setShowNewLib(false); setNewLibName(''); }} title="新建资产库" size="sm">
        <div className="p-6 space-y-4">
          <input autoFocus value={newLibName} onChange={(e) => setNewLibName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newLibName.trim() && (() => { addLibrary(newLibName.trim()); setShowNewLib(false); setNewLibName(''); toast.success('已创建'); })()}
            placeholder="资产库名称"
            className="w-full rounded-xl px-4 py-3 text-sm border border-slate-200 focus:border-slate-400 focus:outline-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setShowNewLib(false); setNewLibName(''); }}>取消</Button>
            <Button variant="primary" onClick={() => { if (newLibName.trim()) { addLibrary(newLibName.trim()); setShowNewLib(false); setNewLibName(''); toast.success('已创建'); } }}>创建</Button>
          </div>
        </div>
      </Modal>

      {/* Rename library modal */}
      <Modal open={!!renameLibId} onClose={() => setRenameLibId(null)} title="重命名资产库" size="sm">
        <div className="p-6 space-y-4">
          <input autoFocus value={renameLibName} onChange={(e) => setRenameLibName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && renameLibId && renameLibName.trim() && (() => { renameLibrary(renameLibId, renameLibName.trim()); setRenameLibId(null); toast.success('已重命名'); })()}
            className="w-full rounded-xl px-4 py-3 text-sm border border-slate-200 focus:border-slate-400 focus:outline-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setRenameLibId(null)}>取消</Button>
            <Button variant="primary" onClick={() => { if (renameLibId && renameLibName.trim()) { renameLibrary(renameLibId, renameLibName.trim()); setRenameLibId(null); toast.success('已重命名'); } }}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* URL import modal */}
      <Modal open={showUrlImport} onClose={() => { setShowUrlImport(false); setImportUrl(''); }} title="链接导入" size="sm">
        <div className="p-6 space-y-4">
          <input autoFocus value={importUrl} onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-xl px-4 py-3 text-sm border border-slate-200 focus:border-slate-400 focus:outline-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setShowUrlImport(false); setImportUrl(''); }}>取消</Button>
            <Button variant="primary" onClick={handleUrlImport}>导入</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { removeAsset(deleteId); toast.success('已删除'); } }}
        title="删除素材" description="确认删除该素材？此操作不可撤销。" danger />

      <ConfirmDialog open={!!deleteLibId} onClose={() => setDeleteLibId(null)}
        onConfirm={() => { if (deleteLibId) { removeLibrary(deleteLibId); toast.success('资产库已删除'); } }}
        title="删除资产库" description="删除资产库将同时删除其中所有素材，此操作不可撤销。" danger />
    </div>
  );
}
