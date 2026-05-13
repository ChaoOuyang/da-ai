'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Grid3X3, List, MoreHorizontal, Edit2, Copy, Trash2, Layout } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const BANNERS = [
  { title: '多模态内容创作', desc: '图·视·文融合，无限画布让创意无边界', bg: 'from-indigo-600/40 to-purple-600/40' },
  { title: 'AI 驱动工作流', desc: '节点连接素材，AI 一键生成内容', bg: 'from-blue-600/40 to-cyan-600/40' },
  { title: '协作与管理', desc: '统一管理多个创作项目，提升团队效率', bg: 'from-purple-600/40 to-pink-600/40' },
];

export default function CanvasPage() {
  const { canvas, addCanvasProject, deleteCanvasProject, duplicateCanvasProject, renameLibrary } = useStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [bannerIdx, setBannerIdx] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  function handleCreate() {
    if (!newName.trim()) { toast.error('请输入画布名称'); return; }
    const project = addCanvasProject(newName.trim());
    setShowNew(false);
    setNewName('');
    toast.success('画布已创建');
    window.location.href = `/canvas/${project.id}`;
  }

  function handleRename() {
    if (!renameId || !renameName.trim()) return;
    useStore.getState().updateCanvasProject(renameId, { name: renameName.trim() });
    setRenameId(null);
    toast.success('重命名成功');
  }

  // Group by date
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups = [
    { label: '今天', items: canvas.projects.filter((p) => p.updatedAt >= today.getTime()) },
    { label: '昨天', items: canvas.projects.filter((p) => p.updatedAt >= yesterday.getTime() && p.updatedAt < today.getTime()) },
    { label: '更早', items: canvas.projects.filter((p) => p.updatedAt < yesterday.getTime()) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="h-full overflow-y-auto" onClick={() => setContextMenu(null)}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Banner carousel */}
        <div className="relative h-44 rounded-2xl overflow-hidden mb-8">
          <div className={`absolute inset-0 bg-gradient-to-br ${BANNERS[bannerIdx].bg}`} />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <h2 className="text-2xl font-bold text-white mb-2">{BANNERS[bannerIdx].title}</h2>
            <p className="text-slate-200 text-sm">{BANNERS[bannerIdx].desc}</p>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={cn('w-2 h-2 rounded-full transition-all', i === bannerIdx ? 'bg-white w-6' : 'bg-white/40')}
              />
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">我的画布</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-md transition-all', view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700')}>
                <Grid3X3 size={15} />
              </button>
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-md transition-all', view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700')}>
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} />新建画布
            </button>
          </div>
        </div>

        {/* Groups */}
        {canvas.projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Layout size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">暂无画布项目</p>
            <p className="text-sm mb-6">新建一个画布开始创作</p>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} />新建画布
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">{group.label}</h3>
                {view === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.items.map((project) => (
                      <div key={project.id} className="group relative">
                        <Link
                          href={`/canvas/${project.id}`}
                          className="block rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500/50 transition-all bg-white shadow-sm"
                        >
                          <div className="aspect-video bg-slate-100">
                            {project.thumbnail ? (
                              <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Layout size={32} />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm text-slate-900 truncate">{project.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(project.updatedAt)}</p>
                          </div>
                        </Link>
                        {/* Context menu trigger */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id: project.id, x: e.clientX, y: e.clientY }); }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 text-white transition-all hover:bg-black/70"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.items.map((project) => (
                      <div key={project.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:border-indigo-500/30 bg-white hover:bg-slate-50 transition-all group shadow-sm">
                        <Link href={`/canvas/${project.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {project.thumbnail ? (
                              <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Layout size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{project.name}</p>
                            <p className="text-xs text-slate-500">{formatDate(project.updatedAt)} · {project.nodes.length} 节点</p>
                          </div>
                        </Link>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setRenameId(project.id); setRenameName(project.name); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { duplicateCanvasProject(project.id); toast.success('已复制'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => setDeleteId(project.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { icon: Edit2, label: '重命名', action: () => { const p = canvas.projects.find((x) => x.id === contextMenu.id); if (p) { setRenameId(p.id); setRenameName(p.name); } setContextMenu(null); } },
            { icon: Copy, label: '复制', action: () => { duplicateCanvasProject(contextMenu.id); toast.success('已复制'); setContextMenu(null); } },
            { icon: Trash2, label: '删除', action: () => { setDeleteId(contextMenu.id); setContextMenu(null); }, danger: true },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button key={label} onClick={action} className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all', danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100')}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
      )}

      {/* New canvas modal */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setNewName(''); }} title="新建画布" size="sm">
        <div className="p-6 space-y-4">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="请输入画布名称"
            className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 text-sm border border-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setShowNew(false); setNewName(''); }}>取消</Button>
            <Button variant="primary" onClick={handleCreate}>创建</Button>
          </div>
        </div>
      </Modal>

      {/* Rename modal */}
      <Modal open={!!renameId} onClose={() => setRenameId(null)} title="重命名画布" size="sm">
        <div className="p-6 space-y-4">
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            placeholder="画布名称"
            className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 text-sm border border-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setRenameId(null)}>取消</Button>
            <Button variant="primary" onClick={handleRename}>保存</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteCanvasProject(deleteId); toast.success('已删除'); } }}
        title="删除画布"
        description="此操作不可撤销，确认删除该画布？"
        danger
      />
    </div>
  );
}
